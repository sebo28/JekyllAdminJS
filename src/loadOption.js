	loadOption() {
		this.options = {
			"/": [
				{
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
				},
				{
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
				},
				{
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
				}
			],
			"/_posts/": [
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
						options: [
							{
								attr: "file.path",
								value: "_other/author/",
								op: "contain"
							}
						],
						value: "title"
					}
				},
				{
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
						options: [
							{
								attr: "file.path",
								value: "_category/",
								op: "contain"
							}
						],
						value: "code"
					}
				},
				{
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
						options: [
							{
								attr: "file.path",
								value: "_tag/",
								op: "contain"
							}
						],
						value: "title"
					}
				}
			]
		};
	}