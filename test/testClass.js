class TestClass extends JekyllAdminJS {
    constructor(settings = {}) {
        super(settings);
        this.function = [];
        this.buffer = [];
    }
    inputInit(obj) {
    }
    navigation() {
        this.function.push("navigation");
        super.navigation();
    }
    write(str, s, status = false) {
        this.function.push("write");
        this.buffer.push(str);
    }
}
var testClass = new TestClass({test: "test"});
testClass.run();

if(window.chai) {
    var expect = chai.expect;
    var assert = chai.assert;
}