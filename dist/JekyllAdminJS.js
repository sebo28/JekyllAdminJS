/**
 * AdminJS v0.1
 *
 * @link   https://github.com/bugra9/JekyllAdminJS
 * @author bugra9 https://github.com/bugra9
 * @license GPLv3
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JekyllAdminJS = function (_AdminJS) {
	_inherits(JekyllAdminJS, _AdminJS);

	function JekyllAdminJS() {
		var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, JekyllAdminJS);

		return _possibleConstructorReturn(this, (JekyllAdminJS.__proto__ || Object.getPrototypeOf(JekyllAdminJS)).call(this, settings));
	}

	_createClass(JekyllAdminJS, [{
		key: 'deleteData',
		value: function deleteData(v) {
			this.github.delete(v);
		}
	}, {
		key: 'renameData',
		value: function renameData(path, newPath) {
			this.github.rename(path, newPath);
		}
	}, {
		key: 'saveData',
		value: function saveData(v, data) {
			var newFile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var path = data['file.path'];
			var content = data.content;
			delete data['file.path'];
			delete data.content;
			var str = '---\n' + jsyaml.dump(data) + '---\n';
			str += content;
			//console.log("str", str);
			var obj = {};
			obj.file = {
				path: path,
				mode: "100644",
				type: "blob",
				//sha: sha1sum(str),
				size: byteCount(str)
			};
			obj.content = data;
			obj.content.content = content;

			//console.log("obj", obj);
			this.github.add(path, str, false);

			if (newFile) this.data.push(obj);else {
				var index = this.findAll([{
					attr: "file.path",
					value: v,
					op: "=="
				}])[0];

				this.data[index] = obj;

				if (v != path) this.github.delete(v);
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
	}, {
		key: 'commit',
		value: function commit(v) {
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
			if (this.github.error) alert(this.github.error);else window.location.href = '#list/_posts/';
		}

		// Üzerine yazılan fonksiyonlar

	}, {
		key: 'loadData',
		value: function loadData() {
			this.github = new Github('', localStorage.token, 'bugra9/bugra9.github.io/master');
			this.data = [];
			var tree = this.getTree();
			for (var i in tree) {
				if (tree[i].mode == "040000") continue;
				var obj = { file: tree[i] };
				if (this.isText(tree[i].path) && localStorage[tree[i].sha] === undefined) {
					var content = this.b64DecodeUnicode(this.github.getData(tree[i].url).content);
					if (this.github.error) {
						alert(this.github.error);
						return;
					}
					if (content.indexOf('---') === 0) {
						content = content.split('---', 3);
						var temp = jsyaml.load(content[1]);
						//console.log("temp", temp);
						temp.content = content[2];
						localStorage[tree[i].sha] = JSON.stringify(temp);
					} else localStorage[tree[i].sha] = JSON.stringify({ content: content });
				}
				if (this.isText(tree[i].path)) obj.content = JSON.parse(localStorage[tree[i].sha]);

				this.data.push(obj);
			}
			//console.log("data: ", this.data);
		}
	}, {
		key: 'isText',
		value: function isText(v) {
			var temp = v.lastIndexOf(".");
			if (temp == -1) return false;
			if (["markdown", "mkdown", "mkdn", "mkd", "md", "js", "css", "txt", "html", "htm"].indexOf(v.substring(temp + 1)) != -1) return true;else return false;
		}
	}, {
		key: 'getTree',
		value: function getTree() {
			//localStorage.clear();
			var shaLatestCommit = this.github.getData('git/refs/heads/master').object;
			if (this.github.error) {
				alert(this.github.error);
				return;
			}
			//localStorage.shaLatestCommit = 0;
			if (localStorage.shaLatestCommit === undefined || shaLatestCommit.sha != localStorage.shaLatestCommit) {
				console.log("Yeni ağaç yükleniyor...");
				localStorage.shaLatestCommit = shaLatestCommit.sha;
				var tree = this.github.getData(this.github.getData(shaLatestCommit.url).tree.url + '?recursive=1');
				if (this.github.error) {
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
	}, {
		key: 'b64DecodeUnicode',
		value: function b64DecodeUnicode(str) {
			return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
		}
	}, {
		key: 'loadMenu',
		value: function loadMenu() {
			this.menu = [{
				title: "Assets",
				path: "list/assets/",
				color: "blue",
				count: "5192"
			}, {
				title: "Posts",
				path: "list/_posts/",
				color: "green",
				count: "82"
			}, {
				title: "Pages",
				path: "list/_root/",
				color: "orange",
				count: "5"
			}, {
				title: "Categories",
				path: "list/_category/",
				color: "yellow",
				count: "5"
			}, {
				title: "Tags",
				path: "list/_tag/",
				color: "olive",
				count: "356"
			}, {
				title: "Yazar",
				path: "list/_other/author/",
				color: "teal",
				count: "25"
			}, {
				html: '<div class="ui  small header center aligned inverted">Advanced</div>'
			}, {
				title: "Extensions",
				path: "list/_extension/",
				color: "pink",
				count: "12"
			}, {
				title: "Themes",
				path: "list/_theme/",
				color: "red",
				count: "1"
			}, {
				html: '<div class="ui  small header center aligned inverted">System</div>'
			}, {
				title: "Commit",
				path: "commit()/",
				color: "",
				count: "0"
			}];
		}
	}, {
		key: 'loadOption',
		value: function loadOption() {
			this.options = {
				"/": [{
					attr: "file.path",
					title: "Konum",
					list: {
						show: false
					},
					edit: {
						order: 1,
						section: 2
					},
					input: {
						type: "text"
					}
				}, {
					attr: "title",
					title: "Başlık",
					list: {
						show: true
					},
					edit: {
						order: 1
					},
					input: {
						type: "text"
					}
				}, {
					attr: "content",
					title: "İçerik",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 1,
						section: 3
					},
					input: {
						type: "text",
						wysiwyg: true
					}
				}],
				"/_posts/": [{
					attr: "title",
					title: "Makale Başlığı",
					list: {
						show: true
					},
					edit: {
						type: 2,
						order: 1
					},
					input: {
						type: "text"
					}
				}, {
					attr: "summary",
					title: "Özet",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 2
					},
					input: {
						type: "text",
						rows: 2
					}
				}, {
					attr: "image",
					title: "Resim",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 6
					},
					input: {
						type: "text"
					}
				}, {
					attr: "thumb",
					title: "Resim",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 6
					},
					input: {
						type: "text"
					}
				}, {
					attr: "permalink",
					title: "Permalink",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 2,
						section: 2
					},
					input: {
						type: "text"
					}
				}, {
					attr: "date",
					title: "Zaman",
					list: {
						show: true
					},
					edit: {
						type: 2,
						order: 3,
						section: 2
					},
					input: {
						type: "date"
					}
				}, {
					attr: "author",
					title: "Yazar",
					list: {
						show: true
					},
					edit: {
						type: 2,
						order: 5
					},
					input: {
						type: "select",
						isRelated: true,
						multiple: false,
						options: [{
							attr: "file.path",
							value: "_other/author/",
							op: "contain"
						}],
						value: "title"
					}
				}, {
					attr: "categories",
					title: "Kategori",
					list: {
						show: true
					},
					edit: {
						type: 2,
						order: 3
					},
					input: {
						type: "select",
						isRelated: true,
						multiple: false,
						options: [{
							attr: "file.path",
							value: "_category/",
							op: "contain"
						}],
						value: "code"
					}
				}, {
					attr: "tags",
					title: "Etiketler",
					list: {
						show: false
					},
					edit: {
						type: 2,
						order: 4
					},
					input: {
						type: "select",
						isRelated: true,
						multiple: true,
						options: [{
							attr: "file.path",
							value: "_tag/",
							op: "contain"
						}],
						value: "title"
					}
				}]
			};
		}
	}]);

	return JekyllAdminJS;
}(AdminJS);