/**
 * AdminJS v0.1
 *
 * @link   https://github.com/bugra9/adminJS
 * @author bugra9 https://github.com/bugra9
 * @license GPLv3
 */

/*
 * ------------------------------------------------------------------------
 * AdminJS, düz dosya bazlı içerik yönetim sistemidir. Dosya sisteminizde bulunan verilerinizi yönetmenizi sağlar.
 *
 * Özellikler: 
 * 		- Açık kaynaklı özgür bir yazılımdır.
 * 		- Veritabanı kullanmaz.
 * 		- Kullanmak için dosya indirmek gerekmez. Sadece sitesine girmeniz yeterlidir. İlk girişten sonra kodları tarayıcı hafızasına aldığı için sonraki girişler için internet bağlantısı gerekmez.
 * 		- Tarayıcı üzerinde istemci tarafında çalışır. Dolayısıyla dosyalarınızı sizden başkası görmez.
 * 		- Github gibi git sistemi kullanarak dosya depolayan servisler ile tam uyumludur.
 * 		- Metin halindeki dosyaları ve geri kalan dosyaları yönetmek için 2 kısımdan oluşur.
 * 		- Yazı özelleştirmesi için markdown, özellik tanımlamaları için yml kullanılır.
 * 		- Github gibi sistemlerde bulunan dosyaları yönetebileceği gibi yerelde bulunan dosyaları da yönetebilir.
 * 		- Jekyll gibi düz dosya sistemini baz almış içerik oluşturucular ile tam uyumludur. 
 * 		- Oldukça esnek bir çalışma yapısı olup istenilen sisteme göre özelleştirilebilir.
 * 		- Oldukça basit bir kullanımı vardır.
 * 		
 * Teknik Bilgi:
 * 		- Sistem fonksiyonel olarak parçalara bölünmüştür.
 * 		- Sistemdeki fonksiyonlar çekirdek, görünüm ve işlevsel olarak üç başlık altında bulunur. 
 * 		- Çekirdek fonksiyonlar dışında özelleştirmek istediğiniz yer varsa bu sınıftaki kodları değiştirmeden, bu sınıftan yeni bir sınıf türetin ve değişecek fonksiyonları tanımlayarak önceki fonksiyonları ezin.
 * 		- Sistem açılan dizin altındaki dosyaları inceleyerek ortak özellikleri belirler. Veri listeleme altında bu ortak özellikleri gösterirken, veri ekleme listesinde bu ortak özellikleri tanımlamanızı ister.
 *   	- Sistemin otomatik özellik belirlemesi dışında istenirse kullacılar dizinler için özellik tanımlaması yapabilir.
 * ------------------------------------------------------------------------
 */
class AdminJS {
	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Parametre olarak ayarları içeren bir nesne alır.
	 * Ayarlar: {
	 * 				debug (0) [0, 1, 2]: Hata ayıklamayı ileti gösterim sıklık seviyesi ayarlanır.
	 * 			}
	 * 	Yapılacaklar: 
	 * ------------------------------------------------------------------------
	 */
	constructor(settings = {}) {
		/*
			-------------------------------------------------------------------
			Ayarlar Oluşturuluyor. 
			Önce varsayılan ayarlar atanıyor. 
			Daha sonra parametre olarak alınanlar varsayılan parametrelerin üzerine yazılıyor.
			-------------------------------------------------------------------
		*/
		this.settings = {
			debug: 0,
		};
		for(let key in settings)
			this.settings[key] = settings[key];

		this.log("Ayarlar Yüklendi.", 2);
		/*
			-------------------------------------------------------------------
			Yazılım başlatılıyor.
			-------------------------------------------------------------------
		*/
		this.changed = [];
		this.log("Yazılım Başlatılıyor...", 2);

		// Geçici olarak bağlanmak için bu kodları ekleyelim.
		var temp = window.location.href.split("#")[1].split('/');
		if(temp[0] == 'connect') {
			localStorage.token = temp[1];
			window.location.href = '#list/_posts/';
		}

		this.log("Veriler Yükleniyor", 2);
		this.data();

		this.log("Menü Yükleniyor", 2);
		this.createMenu();

		this.log("Tetiklemeler yükleniyor", 2);
		this.event();

		this.log("Yazılım başarıyla başlatıldı.", 1);
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: İşlenecek verilerin tanıtılması yapılır.
	 * Kullanılan Değişkenler: data, menu, options
	 * ------------------------------------------------------------------------
	 */
	data() {
		this.log("Veriler yükleniyor", 2);

		/*
			------------------------------------------------------------------------
			Açıklama: Tüm dosyalara ait veriler buraya yazılır. Dizinler burada belirtilmez ve dosya yolundan otomatik çıkarılır.
			Örnek: 	[
						{
							file: {
								path: "_posts/deneme.md",
								sha: "dasfawe...",
								size: 12,
								type: markdown // diğer seçenekler => image|text|yml|js|css|... 
							},
							content: {
								title: "Deneme Makalesi",
								date: ...,
								permalink: "deneme",
								yazar: "...",
								content: "..."
							}
						},
						...
					]
			------------------------------------------------------------------------
		*/
		this.data = [];

		/*
			------------------------------------------------------------------------
			Açıklama: Menüde listelenmesi istenen veriler buraya girilir.
			Örnek: 	[
						{
							title: "Posts",
							path: "/_posts/",
							color: "blue",
							count: "5192"
						},
						...
					]
			------------------------------------------------------------------------
		*/
		this.menu = [];

		/*
			------------------------------------------------------------------------
			Açıklama: Dizinler için nasıl tepki verileceği ayarlanır yani dizinlerin özelleştirmesi burada yapılır. 
				Alt dizinler üst dizinlerin özelliklerini ezer.
			Örnek: 	{
						"/": [
							{
								attr: "title",
								title: "Başlık",
								showList: false,
								input: {
									type: "text" 
								}
							}
						],
						"/_posts/": [
							{
								attr: "title",
								title: "Makale Başlığı",
								showList: true,
								input: {
									type: "text" 
								}
							},
							{
								attr: "categories",
								title: "Kategori",
								showList: true,
								input: {
									type: "select",
									multi: false,
									isRelated: true,
									relatedPath: "/_category/",
									query: {},
									valueAttr: "code"
								}
							}
						],
						...
					}
			Giriş Türleri:
				Text: Düz metin girişi için kullanılır.
					rows: Alanın kaç satırdan oluşacağı belirtilir. Belirtilmediği takdirde bir olarak değerlendirilir.
				Select | !isRelated: Seçenekleri belli olan seçim kutusu için kullanılır.
					multiple: birden fazla seçim yapılıp yapılamayacağı belirtilir.
					options: Seçim kutusunun seçenekleri buraya yazılır. Örn: { key: value, key2: value2}
				Select | isRelated: Seçenekleri başka bir dizine bağlı olup değişebilen seçim kutusu için kullanılır.
					multi: birden fazla seçim yapılıp yapılamayacağı belirtilir.
					relatedPath: Hangi dizine bağlı olduğu yazılır.
					query: Bağlı olduğu dizin altındaki verilerde eleme yapmak için kullanılır. Örn: rengi kırmızı ve boyutu 3kb'dan fazla olanlar
		 			valueAttr: Seçilen verinin hangi özelliği değer/sonuç için kullanılacağı belirtilir.
		 		Date: Zaman seçimi için kullanılır.
		 		Assets: Herhangi bir dosya seçimi için kullanılır.
		 			path: Hangi dizinden seçim yapılacağı belirtilir.
		 			type: image | file
			------------------------------------------------------------------------
		*/
		this.options = {};

		this.log("Veriler yüklendi", 2);
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Adres çubuğunda yazan adrese göre sayfa için hazırlık yapar. 
	 * 		Bir veri kullanılacaksa veri ile ilgili hazırlıkları, dizin kullanılacaksa içerisindeki dosyalarla ilgili hazırlıklar yapılır.
	 * Örnek Adresler:
	 * 		.../list/_posts => Belirtilen yoldaki verileri listeler.
	 * 		.../edit/_posts/deneme.md => Belirtilen yoldaki dosyayı düzenler.
	 * 		.../save/_posts/deneme.md => Belirtilen yoldaki dosyaya değişiklikleri kaydeder.
	 * Kullanılan Değişkenler: 
	 * ------------------------------------------------------------------------
	 */	
	navigation() {
		$('.page').hide();
		var location = window.location.href.split("#")[1];
		var locationArray = location.split("/");

		switch(locationArray[0]) {
			case "list":
				locationArray.shift(); 
				this.navigationList(locationArray.join('/'));
				$('#list').show();
				break;
			case "edit":
				locationArray.shift(); 
				this.navigationEdit(locationArray.join('/'));
				$('#edit').show();
				break;
			case "save":
				locationArray.shift(); 
				this.navigationSave(locationArray.join('/'));
				$('#loader').show();
				break;
			case "delete":
				locationArray.shift(); 
				this.navigationDelete(locationArray.join('/'));
				break;
			case "toggle":
				locationArray.shift(); 
				this.navigationToggle(locationArray.join('/'));
				break;
			default:
				if(locationArray[0].substr(-2) == '()') {
					this[locationArray[0].substr(0, locationArray[0].length - 2)](locationArray.join('/'));
				}
				else
					console.log(locationArray[0] + " sayfası bulunamadı.");
		}
	}

	// Listeleme sayfasının hazırlanması için kullanılan yardımcı fonksiyondur.
	navigationList(v) {
		//console.log("navigationList: ", v);
		var temp = this.findAll([{
			attr: "file.path",
			value: v,
			op: "path"
		}]);
		//console.log('temp: ', temp);
		
		var type = this.getType('/'+v);
		//console.log('type: ', type);
		var attrList = this.getAttrList(temp, type);
		//console.log('attrList: ', attrList);
		
		var temp2 = '';
		for(var i in temp) {
			if(attrList.indexOf('title') == -1)
				temp2 += '<tr><td class="collapsing"><i class="file outline icon"></i> '+ this.data[temp[i]].file.path.split('/').pop() +'</td>';
			else
				temp2 += '<tr><td class="collapsing" title="'+ this.data[temp[i]].file.path +'"><i class="file outline icon"></i></td>';

			for(var a in attrList) {
				if(type[attrList[a]] === undefined)
					type[attrList[a]] = {
						attr: attrList[a],
						title: attrList[a],
						list: {
							show: true
						},
						input: {
							type: "text" 
						}
					};
				temp2 += this.templateInput(type[attrList[a]], this.getDataAttr(attrList[a], temp[i]), 'list');
			}
			var color = "green";
			if((this.data[temp[i]].file.path.split('/')).pop().substr(0,1) == '_')
				color = "red";
			temp2 += `<td class="right aligned collapsing">
								<a href="#edit/${this.data[temp[i]].file.path}"><i class="edit icon"></i></a>
								<a href="#toggle/${this.data[temp[i]].file.path}"><i class="circle icon ${color}"></i></a>
								<a href="#delete/${this.data[temp[i]].file.path}"><i class="remove icon red"></i></a>
							</td></tr>`;
		}
		var tempHeader = '';
		for(var a in attrList)
			if(type[attrList[a]] === undefined)
				tempHeader += '<th>'+ attrList[a] +'</th>';
			else
				tempHeader += '<th>'+ type[attrList[a]].title +'</th>';

		//console.log(temp2);
		this.write('<tr><th></th>'+ tempHeader+ '<th>İşlemler</th></tr>', 'thead', true);
		this.write(temp2, 'tbody', true);

		var dirs = this.getDirs(v);
		temp = '';
		for(i in dirs)
			temp += `
<a class="item" href="#list/${v}${dirs[i]}/">
	<i class="big folder icon"></i>
	<div class="content">
		<div class="header">${dirs[i]}</div>
	</div>
</a>`;
		this.write(temp, '#dirs', true);
	}

	// Düzenleme sayfasının hazırlanması için kullanılan yardımcı fonksiyondur.
	navigationEdit(v) {
		$('#saveButton').attr('href', '#save/'+v);

		var index = this.findAll([{
			attr: "file.path",
			value: v,
			op: "=="
		}])[0];
		var data = this.data[index];
		//console.log("data", data);

		var path = v.split('/');
		path.pop();
		path = path.join('/')+'/'; 
		var type = this.getType('/'+path);
		//console.log("type", type);

		var attr = [[], [], [], []];
		attr[2].push('file.path');
		for(var i in data.content) {
			if(type[i] === undefined)
				attr[0].push(i);
			else if(type[i].edit.section !== undefined)
				attr[type[i].edit.section].push(i);
			else
				attr[1].push(i);
		}
		//console.log("attr", attr);

		var temp2 = '';
		for(i in attr[1]) {
			temp2 += this.templateInput(type[attr[1][i]], this.getDataAttr(attr[1][i], index), 'edit');
		}
		this.write('<h4 class="ui dividing header">Genel Bilgiler</h4>' + temp2, '#edit1', true);

		temp2 = '';
		for(i in attr[2]) {
			temp2 += this.templateInput(type[attr[2][i]], this.getDataAttr(attr[2][i], index), 'edit');
		}
		this.write('<h4 class="ui dividing header">Yayınlama Bilgileri</h4>' + temp2, '#edit2', true);

		temp2 = '';
		for(i in attr[0]) {
			temp2 += this.templateInput(this.defaultType(attr[0][i], this.getDataAttr(attr[0][i], index)), this.getDataAttr(attr[0][i], index), 'edit');
		}
		this.write(temp2, '#edit0', true);

		temp2 = '';
		for(i in attr[3]) {
			temp2 += this.templateInput(type[attr[3][i]], this.getDataAttr(attr[3][i], index), 'edit');	
		}
		this.write(temp2, '#edit3', true);


		this.inputInit({url: v});
	}

	// Kaydetme sayfasının hazırlanması için kullanılan yardımcı fonksiyondur.
	navigationSave(v) {
		console.log("save");
		var data = {};
		$('#edit :input').each(function() {
			if($(this).attr('name') === undefined)
				return;
			
			if($(this).attr('type') == 'datetime') {
				var date = new Date($(this).parents('.ui.calendar').calendar('get date'));
				date.setHours(date.getHours() + 3);
				date = date.toJSON();
				data[$(this).attr('name')] = date.substring(0, date.indexOf('T'))+' '+date.substring(date.indexOf('T')+1, date.lastIndexOf(':'));
			}
			else
				data[$(this).attr('name')] = $(this).val();
		});
		//console.log("data", data);
		this.saveData(v, data);

		window.location.href = '#list/' + v.substring(0, v.lastIndexOf('/')+1);
	}

	saveData(v, data) {

	}

	navigationDelete(v) {
		var index = this.findAll([{
			attr: "file.path",
			value: v,
			op: "=="
		}])[0];
		this.data.splice(index, 1);
		this.deleteData(v);

		window.location.href = '#list/' + v.substring(0, v.lastIndexOf('/')+1);
	}

	deleteData(v) {

	}

	navigationToggle(v) {
		var index = this.findAll([{
			attr: "file.path",
			value: v,
			op: "=="
		}])[0];
		var temp = this.data[index].file.path.split('/');
		var name = temp.pop();
		if(name.substr(0, 1) == '_')
			name = name.substr(1);
		else
			name = '_' + name;

		this.data[index].file.path = temp.join('/') + '/' + name;

		this.renameData(v, this.data[index].file.path);

		window.location.href = '#list/' + v.substring(0, v.lastIndexOf('/')+1);
	}

	renameData(path, newPath) {

	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Adresi değiştirir ve değişim sonucu yeni sayfanın hazırlanmasını söyler.
	 * ------------------------------------------------------------------------
	 */
	changeUrl(url) {

		this.navigation();
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: İlgili tetiklemelerin yapıldığı alandır.
	 * ------------------------------------------------------------------------
	 */
	event() {
		let _this = this;
		window.addEventListener("hashchange", function() { _this.changeUrl(); }, false);
		this.changeUrl();
	}

	defaultType(attr, value) {
		if(typeof value === 'object')
			;
		else if(Array.isArray(value))
			return {
				attr: attr,
				title: attr,
				list: {
					show: true
				},
				input: {
					type: "select",
					isRelated: false,
					multiple: true,
					options: []
				}
			};
		else
			return {
				attr: attr,
				title: attr,
				list: {
					show: true
				},
				input: {
					type: "text" 
				}
			};
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Verilen parametrelere uyan verileri döndürür.
	 * ------------------------------------------------------------------------
	 */ 
	findAll2(v) {
		var dataTemp = [];
		for(var i in this.data) {
			var temp = this.data[i].file.path.split('/');
			temp.pop();
			if(temp.join('/') == v)
				dataTemp.push(i);
		}
		return dataTemp;
	}

	findAll(options) {
		var dataTemp = [];
		for(var i in this.data) {
			var status = true;

			for(var i2 in options) {
				var attr = this.getDataAttr(options[i2].attr, i);

				if(!this.condition(options[i2].op, attr, options[i2].value)) {
					status = false;
					break;
				}
			}

			if(status)
				dataTemp.push(i);
		}
		return dataTemp;
	}

	getDataAttr(v, i) {
		var temp = v.split('.');
		var attr = "";
		if(temp.length == 1)
			attr = this.data[i].content;
		else
			attr = this.data[i];
		for(var i3 in temp)
			attr = attr[temp[i3]];
		return attr;
	}

	condition(op, key, value) {
		switch(op) {
			case "==":
				return (key == value);
			case ">=" :
				return (key >= value);
			case ">" :
				return (key > value);
			case "<=" :
				return (key <= value);
			case "<" :
				return (key < value);
			case "[]":
				return (value.indexOf(key) != -1);
			case "contain":
				return (key.indexOf(value) != -1);
			case "path":
				return (key.indexOf(value) != -1 && key.split('/').length == value.split('/').length);
		}
		return false;
	}

	getDirs(v) {
		var temp2 = {};
		var len = v.split('/').length;
		for(var i in this.data) {
			var temp = this.data[i].file.path.split('/').length;
			if(this.data[i].file.path.indexOf(v) === 0 && temp == len + 1)
				temp2[this.data[i].file.path.substring(v.length, this.data[i].file.path.lastIndexOf('/'))] = 0;
		}
		var temp3 = [];
		for(i in temp2)
			temp3.push(i);
		return temp3;
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Listeleme yapılacak verilerin sütunlarının analizini yapar.
	 * Ne kadar çok kullanılmış diye.
	 * ------------------------------------------------------------------------
	 */ 
	getAttrList(index, type) {
		var ret = [];
		var count = {};
		for(var i in index) {
			var data2 = this.data[index[i]];
			for(var i2 in data2.content) {
				if(count[i2] === undefined)
					count[i2] = 1;
				else
					++count[i2];
			}	
		}
		count['file.path'] = index.length;
		// Sıralayalım.
		var sortable = [];
		for (i in count)
		    sortable.push([i, count[i]]);
		sortable.sort(function(a, b) { return a[1] - b[1] });
		
		for(i in sortable) {
			sortable[i][1] = sortable[i][1] / index.length * 100;
			if(sortable[i][1] > 50 && !(type[sortable[i][0]] && type[sortable[i][0]].list.show == false) && ret.length < 10)
				ret.push(sortable[i][0]);
		}
		return ret;
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: 
	 * ------------------------------------------------------------------------
	 */ 
	getType(v) {
		//console.log('v: ', v);
		var dataTemp = {};
		for(var i in this.options) {
			if(v.indexOf(i) != -1)
				for(var i2 in this.options[i])
					dataTemp[this.options[i][i2].attr] = this.options[i][i2];
		}
		return dataTemp;
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Hata ayıklama için verilen bilgileri uçbirime basar.
	 * ------------------------------------------------------------------------
	 */ 
	log(message, level) {
		if(this.settings.debug >= level)
			console.log(message);
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Menü yapısını oluşturur ve ilgili yere yazdırır.
	 * ------------------------------------------------------------------------
	 */ 
	createMenu() {
		this.log("Menü Oluşturuluyor", 2);

		this.log("====== Menü Nesnesi =====", 2);
		this.log(this.menu, 2);

		let temp = '';
		for(let i in this.menu)
			if(this.menu[i].html)
				temp += this.menu[i].html;
			else
				temp += `
					<a class="item" href="#${this.menu[i].path}">
						${this.menu[i].title} 
						<div class="ui left pointing label ${this.menu[i].color}">${this.menu[i].count}</div>
					</a>`;
		this.write(temp, '#menu');

		this.log("Menü oluşturuldu", 2);
	}

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: İlgili çıktıları ilgili yerlere yazılmasını sağlar.
	 * ------------------------------------------------------------------------
	 */ 
	write(str, s, status = false) {
		if(status)
			$(s).html(str);
		else
			$(s).append(str);
	}

	/**
	* ------------------------------------------------------------------------
	* 				TASARIM İLE İLGİLİ FONKSİYONLAR
	* ------------------------------------------------------------------------
	*/

	/**
	 * ------------------------------------------------------------------------
	 * Açıklama: Hem listeleme sayfasında hem de düzenleme sayfasında özelliklere ait girişlerin nasıl görüleceği belirtilir.
	 * Türler: 
	 * 		Text: Eğer satır sayısı tanımlanmış ve birden büyükse textarea, değilse text input gösterecek şekilde ayarlanır.
	 *   	Select: Sabit seçeneklere sahipse bunlar değilse ilgili yer ile bağlantı kurulup oradaki veriler seçenek olarak listelenir.
	 * ------------------------------------------------------------------------
	 */ 
	
	
	templateInput(attr, value, type) {
		let temp = {list: "", edit: ""};
		let temp2 = '';
		switch(attr.input.type) {
			case "text":
				// List
				temp.list = '<td>' + value + '</td>';
				
				// Edit
				var class2="";
				if(attr.input.wysiwyg)
					class2="mdEditor";
				if((attr.input.rows && attr.input.rows > 1) || attr.input.wysiwyg)
					temp.edit = `
<div class="field">
	<label>${attr.title}</label>
	<textarea class="${class2}" rows="${attr.input.rows}" name="${attr.attr}">${value}</textarea>
</div>`;
				else
					temp.edit = `
<div class="field">
	<label>${attr.title}</label>
	<input type="text" name="${attr.attr}" value="${value}" />
</div>`;
				
				break;
			case "date":
				// List
				var date = new Date(value);
				var month = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz",
							"Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
				temp.list = '<td title="'+ value +'">'+ date.getDate() +' '+ month[date.getMonth()] +' '+ date.getFullYear() +'</td>';

				// Edit
				temp.edit = `
<div class="field">
	<label>${attr.title}</label>
	<div class="ui calendar">
		<div class="ui input left icon">
			<i class="calendar icon"></i>
			<input type="datetime" placeholder="Zaman" name="${attr.attr}" value="${value}">
		</div>
	</div>
</div>`;
				
				break;
			case "select":
				// List
				if(attr.input.isRelated && value !== "") {
					var options = attr.input.options.slice(0);
					var op = "==";
					if(Array.isArray(value))
						op = "[]";
					options.push({
						attr: attr.input.value,
						value: value,
						op: op
					});
					var out = this.findAll(options);
					if(out.length === 0)
						temp2 = '';
					else if(out.length == 1)
						temp2 = this.data[out[0]].content.title;
					else {
						temp2 = '';
						for(var i in out)
							temp2 += '<div class="ui label">'+ this.data[out[i]].content.title +'</div>';
					}
				}
				else
					temp2 = value;
				temp.list = '<td>' + temp2 + '</td>';

				// Edit
				if(attr.input.multiple)
					temp2 = 'multiple';
				else
					temp2 = '';
				temp.edit = `
<div class="field">
	<div class="leftRight">
		<label>${attr.title}</label>
		<div><i class="add icon green link"></i></div>
	</div>
	<select class="ui selection dropdown search" name="${attr.attr}" ${temp2}>`;
				if(!attr.input.isRelated) {
					for(let i in attr.input.options) {
						if(i == value) 
							temp2 = "selected";
						else 
							temp2 = "";
						temp.edit += `<option value="${i}" ${temp2}>${attr.input.options[i]}</option>`;	
					}
				}
				else {
					let temp3 = this.findAll(attr.input.options);
					for(let i in temp3) {
						if(!Array.isArray(value))
							value = [value];

						if(value.indexOf(this.data[temp3[i]].content[attr.input.value]) != -1) 
							temp2 = "selected";
						else 
							temp2 = "";
						temp.edit += `<option value="${this.data[temp3[i]].content[attr.input.value]}" ${temp2}>${this.data[temp3[i]].content.title}</option>`;	
					}
				}
				temp.edit += `
	</select>
</div>`;

				break;
		}
		return temp[type];
	}

	inputInit(obj) {
		$('.tabMenu.menu .item').tab();
		$('.ui.dropdown.search.addition').dropdown({
			allowAdditions: true
		});
		$('.ui.dropdown:not(.addition)').dropdown();
		$('.ui.calendar').calendar({
			monthFirst: false,
			ampm: false,
			today: true,
			text: {
				days: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
				months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
				monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
				today: 'Bugün',
				now: 'Şu an',
				am: 'ÖÖ',
				pm: 'ÖS'
			}
		});

		new SimpleMDE(
		{
			element: $(".mdEditor")[0],
			toolbar: ["bold", "italic", "heading-2", "heading-3", "heading-4", 
				{
			        name: "definition-list",
			        action: function(editor){
			        	var cm = editor.codemirror;
						var startPoint = cm.getCursor("start");
						var endPoint = cm.getCursor("end");
						var text = cm.getSelection();
						cm.replaceSelection("Tanımlanacak İsim\n: Buraya tanım yazılacak.");
						cm.setSelection(startPoint, endPoint);
			        },
			        className: "fa fa-book",
			        title: "İsim Tanımlama",
			    },
				"|", "quote", "code", "unordered-list", "ordered-list", "|", 
				"link", 
				{
					name: "Resim",
					title: "Resim ekle",
					className: "fa fa-picture-o",
					tagName: "a",
					action: function(editor){
						cm = editor.codemirror;
						$('#imageModal input:text').val('');
						modalToggle($('#imageModal'));

						if(!$('#imageModal .positive.button').hasClass('ok')) {
							$('#imageModal .positive.button').addClass('ok');
							$('#imageModal .positive.button').on('click', function() {
								$('#imageModal').removeClass('active');$('#imageModal').parent().removeClass('active');
								var startPoint = cm.getCursor("start");
								var endPoint = cm.getCursor("end");
								var text = cm.getSelection();
								var url = $('#imageModal input:text').val();

								cm.replaceSelection("!["+text+"]("+url+")");
								cm.setSelection(startPoint, endPoint);
							});
						}
					}
				}, 
				"table", "horizontal-rule", "|", "preview", "side-by-side", "fullscreen"
			],
			lang: {
				"bold": "Kalın",
				"italic": "Eğik",
				"strikethrough": "",
				"heading-1": "Başlık 1",
				"heading-2": "Başlık 2",
				"heading-3": "Başlık 3",
				"heading-4": "Başlık 4",
				"code": "Kod",
				"quote": "Alıntı",
				"unordered-list": "Genel Liste",
				"ordered-list": "Numaralı Liste",
				"link": "Bağlantı Oluştur",
				"image": "Resim Ekle",
				"table": "Tablo Ekle",
				"horizontal-rule": "Yatay Çizgi Ekle",
				"preview": "Önizlemeyi Aç/Kapa",
				"side-by-side": "Yan Önizlemeyi Aç/Kapa",
				"fullscreen": "Tam Ekran Yap/Çık",
				"guide": "Rehber",
				"undo": "Geri Al",
				"redo": "İleri Al"
			},
			promptTexts: {
				link: "Bağlantı Adresi:",
				image: "Resim Bağlantısı:",
				def: "Tanımlanacak İsim:"
			},
			insertTexts: {
				table: ["", "\n\nBaşlık 1 | Başlık 2 | Başlık 3\n:--- | ---: | :---\nYazı | Yazı | Yazı\nYazı | Yazı | Yazı\n\n"]
			},
			spellChecker: false,
			autosave: {
				enabled: true,
				uniqueId: obj.url,
				delay: 3000,
			},
			promptURLs: true,
			autofocus: true,
			tabSize: 4,
			previewClassName: "markdown-body",
			renderingConfig: {
				singleLineBreaks: false,
				codeSyntaxHighlighting: true
			},
			previewRenderExtend: function(v) {
				/* Definition Lists*/
				v = v.replace(
					/^(<li>|<p>)(.*)\n:[\t| ](.*?[\S\s]*?)(<\/p>|<ul>|<\/li>)$/gmi, 
					function myFunction(t, tag1, x, y, tag2){
						if(tag1 == '<p>') {
						tag1 = '';
						tag2 = '';
						}
						return tag1+'<dl><dt>'+x+'</dt><dd>'+y+'</dd></dl>'+tag2;
					}
				);
				/* Video */
				v = v.replace(
					/<a href="https:\/\/www.youtube.com\/embed\/(.*?)">https:\/\/www.youtube.com\/embed\/(.*?)<\/a>/gmi,
					function myFunction2(t, id) {
						console.log(t);
						return '<div class="r16_9"><iframe src="https://www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen> </iframe></div>';
					}
				);

				return v;
			}
		});
		//simplemde.toggleFullScreen();


	}
	
}
