/**
 * GitHub API Javascript Client
 *
 * @link   https://github.com/bugra9/github-api
 * @author bugra9
 */

function Github(p1, p2, p3) {
	this.user = '';
    this.pass = '';
    this.owner = '';
    this.repo = '';
    this.branch = '';
    this.renamedORdeleted = false;
    this.files = [];
    this.error = false;

	this.init = function(user, password, repo) {
		repo = typeof repo !== 'undefined' ?  repo : "";
		this.user = user;
		this.pass = password;
		this.setRepo(repo);
    };
    this.setRepo = function(repo) {
    	var temp = repo.split('/');
    	if(temp.length == 3) {
    		this.owner = temp[0];
    		this.repo = temp[1];
    		this.branch = temp[2];
    	}
    };

    /*this.add = function(path, content, base64) {
        base64 = typeof base64 !== 'undefined' ?  base64 : true;
        if(base64)
            content = window.btoa(unescape(encodeURIComponent(content)));
        var data = {
            'content': content,
            'encoding': "base64"
        };
        this.file.push({
            //"sha": this.getData('git/blobs', data, 'POST').sha,
            "path": path,
            "mode": "100644",
            "type": "blob",
            "content": content 
        });
        for(var i in this.deletedFiles)
            if(this.deletedFiles[i] == path)
                this.deletedFiles.splice(i, 1);

    };

    this.delete = function(path) {
        this.deletedFiles.push(path);
    };
    this.rename = function(path, newPath) {
        this.renamedFiles.push([path, newPath]);
    };*/
    this.add = function(path, content) {
        this.files.push({
            type: "add",
            path: path,
            content: content
        });
    };
    this.delete = function(path) {
        this.renamedORdeleted = true;
        this.files.push({
            type: "delete",
            path: path
        });
    };
    this.rename = function(path, newPath) {
        this.renamedORdeleted = true;
        this.files.push({
            type: "rename",
            path: path,
            newPath: newPath
        });
    };

    this.commit = function(msg, authorName, authorEmail) {
        if(this.files.length === 0)
            return;
        authorName = typeof authorName !== 'undefined' ?  authorName : false;
        authorEmail = typeof authorEmail !== 'undefined' ?  authorEmail : false;
        // Store the SHA for the latest commit
        var shaLatestCommit = this.getData('git/refs/heads/'+this.branch).object;

        // Store the SHA for the tree
        var tree = this.getData(this.getData(shaLatestCommit.url).tree.url);
        shaLatestCommit = shaLatestCommit.sha;
        
        // Create a tree containing the file(s) we wish to add and post it
        var newTree = {};
        var shaNewTree = "";

        // ----
        if(this.renamedORdeleted) {
            var index = {};
            tree = this.getData('git/trees/' + tree.sha + '?recursive=1');
            if(!tree.truncated) {
                tree = tree.tree;

                for(var i in tree)
                    index[tree[i].path] = tree[i];

                for(i in this.files) {
                    switch(this.files[i].type) {
                        case "add":
                            if(index[this.files[i].path] === undefined) {
                                var temp = tree.push({
                                    "path": this.files[i].path,
                                    "mode": "100644",
                                    "type": "blob",
                                    "content": this.files[i].content 
                                });
                                index[this.files[i].path] = tree[temp];
                            }
                            else
                                index[this.files[i].path].content = this.files[i].content;
                            break;
                        case "delete":
                            index[this.files[i].path].type = undefined;
                            break;
                        case "rename":
                            index[this.files[i].path].path = this.files[i].newPath;
                            index[this.files[i].newPath] = index[this.files[i].path];
                            delete index[this.files[i].path];
                            break;
                    }
                }

                for(i in tree)
                    if(tree[i].type === undefined || tree[i].type == 'tree')
                        tree.splice(i, 1);

                /*for(var i in this.deletedFiles) {
                    temp = tree.findIndex(function(a) { return a.path === this.toString(); }, this.deletedFiles[i]);
                    tree.splice(temp, 1);
                }
                for(i in this.renamedFiles) {
                    temp = tree.findIndex(function(a) { return a.path === this.toString(); }, this.renamedFiles[i][0]);
                    tree[temp].path = this.renamedFiles[i][1];
                }

                for(i in tree)
                    if(tree[i].type == 'tree')
                        tree.splice(i, 1);
                */

                newTree.tree = tree;
                shaNewTree = this.getData('git/trees', newTree, 'POST').sha;
            }
        }
        else {
            newTree.tree = [];
            for(var i2 in this.files)
                newTree.tree.push({
                    "path": this.files[i2].path,
                    "mode": "100644",
                    "type": "blob",
                    "content": this.files[i2].content 
                });
            newTree.base_tree = tree.sha;
            shaNewTree = this.getData('git/trees', newTree, 'POST').sha;
        }

        // Create a commit which references your new tree
        var data = {
            'message': msg,
            'parents': [shaLatestCommit],
            'tree': shaNewTree
        };
        if(authorName && authorEmail)
            data.author = {
                'name': authorName,
                'email': authorEmail,
                'date': (new Date()).toISOString()
            };
        var shaNewCommit = this.getData('git/commits', data, 'POST').sha;

        // Update HEAD
        data = {
            'sha': shaNewCommit,
            'force': true
        };
        var final = this.getData('git/refs/heads/'+this.branch, data, 'POST');
        console.log(final);
    };

    this.getData = function(url, data, method) {
        if(this.error)
            return this.error;
    	data = typeof data !== 'undefined' ?  data : [];
    	method = typeof method !== 'undefined' ?  method : "GET";
    	var output;

    	if(url.substr(0, 4) != 'http')
    		url = 'https://api.github.com/repos/' + this.owner + '/' + this.repo + '/' + url;

    	var request = new XMLHttpRequest();
		request.open(method, url, false);
		request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        if(this.pass)
		  request.setRequestHeader('Authorization', 'Basic ' + window.btoa(this.user + ':' + this.pass));
		request.setRequestHeader('Accept', 'application/json');
		request.send(JSON.stringify(data));

		if (request.status === 200 || request.status === 201) {
			return JSON.parse(request.responseText);
		}
		else {
			console.log("ERROR: "+request.status);
            this.error = "ERROR: "+request.status+" ("+JSON.parse(request.responseText).message+")";
        }

		return false;
    };

	this.init(p1, p2, p3);
}
