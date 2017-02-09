
	// Üzerine yazılan fonksiyonlar
	loadData() {
		this.github = new Github('', localStorage.token, 'bugra9/bugra9.github.io/master');	
		this.data = [];
		var tree = this.getTree();
		for(var i in tree) {
			if(tree[i].mode == "040000")
				continue;
			var obj = {file: tree[i]};
			if(this.isText(tree[i].path) && localStorage[tree[i].sha] === undefined) {
				var content = this.b64DecodeUnicode(this.github.getData(tree[i].url).content);
				if(this.github.error) {
            		alert(this.github.error);
            		return;
				}
				if(content.indexOf('---') === 0) {
					content = content.split('---', 3);
					var temp = jsyaml.load(content[1]);
					//console.log("temp", temp);
					temp.content = content[2];
					localStorage[tree[i].sha] = JSON.stringify(temp);
				}
				else 
					localStorage[tree[i].sha] = JSON.stringify({content: content});
			}
			if(this.isText(tree[i].path))
				obj.content = JSON.parse(localStorage[tree[i].sha]);

			this.data.push(obj);
		}
		//console.log("data: ", this.data);

	}

	isText(v) {
		var temp = v.lastIndexOf(".");
		if(temp == -1)
			return false;
		if(["markdown", "mkdown", "mkdn", "mkd", "md", "js", "css", "txt", "html", "htm"].indexOf(v.substring(temp+1)) != -1)
			return true;
		else
			return false;
	}

	getTree() {
		//localStorage.clear();
		var shaLatestCommit = this.github.getData('git/refs/heads/master').object;
		if(this.github.error) {
    		alert(this.github.error);
    		return;
		}
		//localStorage.shaLatestCommit = 0;
		if(localStorage.shaLatestCommit === undefined || shaLatestCommit.sha != localStorage.shaLatestCommit) {
			console.log("Yeni ağaç yükleniyor...");
			localStorage.shaLatestCommit = shaLatestCommit.sha;
			var tree = this.github.getData(this.github.getData(shaLatestCommit.url).tree.url+'?recursive=1');
			if(this.github.error) {
        		alert(this.github.error);
        		return;
			}
			//var tree = this.github.getData("https://api.github.com/repos/ubuntu-tr/ubuntu-tr.github.io/git/trees/a5e2062ad6b013774eea8a42056b575c193ef234");
			//var tree = this.github.getData("https://api.github.com/repos/ubuntu-tr/ubuntu-tr.github.io/git/trees/0b8c1fcdcb340c0e00265269d35c3003af90eb7e");
			localStorage.shaTree = tree.sha;
			localStorage[tree.sha] = JSON.stringify(tree.tree);
			return tree.tree;
		}
		//console.log(localStorage[localStorage.shaTree]);
		return JSON.parse(localStorage[localStorage.shaTree]);
	}

	b64DecodeUnicode(str) {
		return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
		    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
	}
	