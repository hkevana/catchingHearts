/* global Vue */
/* global axios */
var app = new Vue({
    el: '#app',
    data: {
        displayAll: true,
        displayStep: [
            { 
                step: false ,
                comments: []
            },
            { 
                step: false,
                comments: []
            },
            { 
                step: false,
                comments: [] 
            },
            { 
                step: false, 
                comments: []
            }
        ],
        showForm: false,
        user: null,
        username: '',
        password: '',
        error: '',
        comment: ''
    },
    created() {
        this.getUser();
        this.getComments();
    },
    methods: {
        displayOverview() {
            this.displayAll = true;
            for(let i = 0; i < this.displayStep.length; i++) {
                this.displayStep[i].step = false;
            }
        },
        displaySteps(index) {
            this.displayAll = false;
            this.displayStep[index].step = true;
        },
        goBack(index) {
            this.displayStep[index--].step = false;
            this.displayStep[index].step = true;
        },
        goForward(index) {
            this.displayStep[index++].step = false;
            this.displayStep[index].step = true;
        },
        toggleForm() {
            this.error = "";
            this.username = "";
            this.password = "";
            this.showForm = !this.showForm;
        },
        closeForm() {
            this.showForm = false;
        },
        async register() {
            console.log("called register() async");
            this.error = "";
            try {
                let response = await axios.post("/api/users", {
                    username: this.username,
                    password: this.password
                });
                this.user = response.data;
                this.login();
            }
            catch (error) {
                console.log(error);
                this.error = error.response.data.message;
            }
        },
        async login() {
            this.error = "";
            try {
                let response = await axios.post("/api/users/login", {
                    username: this.username,
                    password: this.password
                });
                this.user = response.data;
                // close the dialog
                this.toggleForm();
            }
            catch (error) {
                console.log(error);
                this.error = error.response.data.message;
            }
        },
        async logout() {
            try {
                let response = await axios.delete("/api/users");
                this.user = null;
            }
            catch (error) {
                // don't worry about it
            }
        },
        async getUser() {
            try {
                let response = await axios.get("/api/users");
                this.user = response.data;
            }
            catch (error) {
                // Not logged in. That's OK!
            }
        },
        async addComment() {
            console.log("called addComment()");
            try {
                if (this.comment == '') {
                    this.error = 'please provide comment before submitting';
                    return;
                }
                if (this.user == null) {
                    throw ("please login");
                }
                let stepIndex = 0;
                for(let i = 0; i < this.displayStep.length; i++) {
                    if (this.displayStep[i].step == true) {
                        stepIndex = i;
                        break;
                    }
                }
                let response = await axios.post('/api/comments', {
                    step: stepIndex,
                    name: this.user.username,
                    comment: this.comment,
                });
                this.comment = '';
                this.getComments();
            } catch(err) {
                this.toggleForm();
                this.error = err;
            }
        },
        async deleteComment(comment) {
            console.log('called deleteComment');
            try {
                if (this.user == null) {
                    throw ("please login");
                }
                if (this.user.username != comment.name) {
                    throw ("must be comment owner to delete");
                }
                console.log('id: ' + comment._id);
                let response = await axios.delete('/api/comments/' + comment._id);
                this.getComments();
            } catch(err) {
                this.toggleForm();
                this.error = err;
            }
        },
        async increment(id, mode) {
            console.log('called increment(' + id + ',' + mode + ')');
            try {
                const response = await axios.put('/api/comments/increment', {
                    _id: id,
                    type: mode,
                });
                this.getComments();
            } catch(err) {
                console.log(err);
            }
        },
        async getComments() {
            console.log('called getComments()');
            for (let i = 0; i < this.displayStep.length; i++) {
                this.displayStep[i].comments = [];
            }
            try {
                const response = await axios.get('/api/comments/get');
                console.log(response.data);
                for (let i = 0; i < response.data.length; i++) {
                    this.displayStep[response.data[i].step].comments.push(response.data[i]);
                }
            } catch(err) {
                console.log(err);
            }
        },
        clearError() { this.error = ''; }
    },
    computed: {
        filteredStep() {
            return this.displayStep.filter(item => {
                if (item.step) {
                    return item.comments.sort((a, b) => {
                        var rval = 0;
                        if (a.likes < b.likes) {
                            rval = 1;
                        } else {
                            rval = -1;
                        }
                        return rval;
                    });
                }
            });
        }
    }
});