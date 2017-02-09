
	deleteData(v) {
		this.github.delete(v);
	}

	renameData(path, newPath) {
		this.github.rename(path, newPath);
	}
	
	saveData(v, data, newFile = false) {
		var path = data['file.path'];
		var content = data.content;
		delete data['file.path'];
		delete data.content;
		var str = `---
` + jsyaml.dump(data) + `---
`;
		str += content;
		//console.log("str", str);
		var obj = {};
		obj.file = {
			path: path,
			mode: "100644",
			type: "blob",
			//sha: sha1sum(str),
			size: byteCount(str),
			//url: "https://api.github.com/repos/bugra9/ubuntu-tr.github.io/git/blobs/" + sha1sum(str)
		};
		obj.content = data;
		obj.content.content = content;

		//console.log("obj", obj);
		this.github.add(path, str, false);

		if(newFile)
			this.data.push(obj);
		else {
			var index = this.findAll([{
				attr: "file.path",
				value: v,
				op: "=="
			}])[0];

			this.data[index] = obj;

			if(v != path)
				this.github.delete(v);
		}
		/*this.changed.push({
			path: v,
			newPath: path,
			content: str,
			newSha: obj.file.sha,
			sha: this.data[index].file.sha
		});*/

		function byteCount(str) {
		    return encodeURI(str).split(/%..|./).length - 1;
		}
		/*function sha1sum(str) {
			var shaObj = new jsSHA("SHA-1", "TEXT");
			shaObj.update('blob ' + byteCount(str) + '\u0000' + str);
			return shaObj.getHash("HEX");
		}*/
	}

	commit(v) {
		$('#loader').show();
		console.log("Commit...");
		/*console.log("Tree", this.changed);
		for(var i in this.changed) {
			var data = this.changed[i];
			this.github.add(data.newPath, data.content);
		}
		if(this.changed.length !== 0)
			this.github.commit("Değişiklikler kaydediliyor...");
		*/
		this.github.commit("Değişiklikler kaydediliyor...");
		if(this.github.error)
            alert(this.github.error);
        else
			window.location.href = '#list/_posts/';
	}
