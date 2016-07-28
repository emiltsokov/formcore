(function( w, $ ) {
	"use strict";
	var simple;

	function commonSetup(){
		$(document).trigger("enhance");
		simple = $( "#simple" ).data( "NumericInput" );
	}

	module( "Methods", {
		setup: commonSetup
	});

	test("initMaxlength", function(){
		simple.initMaxlength();
		equal(simple.maxLength, Infinity);

		simple.$el.attr("maxlength", 10);
		simple.initMaxlength();
		equal(simple.maxLength, 10);

		simple.$el.removeAttr("maxlength");
		simple.$el.attr("max", 200);
		simple.initMaxlength();
		equal(simple.maxLength, 3);
	});

	test("isNumeric key range", function(){
		// first range from 48 to 57
		ok(!simple.isNumeric(47));
		ok(simple.isNumeric(48));
		ok(simple.isNumeric(57));
		ok(!simple.isNumeric(58));

		// second range from 96 to 105
		ok(!simple.isNumeric(95));
		ok(simple.isNumeric(96));
		ok(simple.isNumeric(105));
		ok(!simple.isNumeric(106));
	});

	test("isMetaKeyAllowed", function(){
		ok(simple.isMetaKeyAllowed(event = {
			keyCode: -1,
			altKey: true
		}));

		ok(simple.isMetaKeyAllowed(event = {
			keyCode: -1,
			ctrlKey: true
		}));

		ok(simple.isMetaKeyAllowed(event = {
			keyCode: -1,
			metaKey: true
		}));

		$.each(window.NumericInput.allowedKeys, function(i, k){
			ok(simple.isMetaKeyAllowed(event = {
				keyCode: k
			}));
		});

		ok(simple.isMetaKeyAllowed(event = {
			keyCode: 38
		}));

		simple.isNavDisabled = true;
		ok(!simple.isMetaKeyAllowed(event = {
			keyCode: 38
		}));
	});

	function preventDefault(){
		ok(true, "preventDefault called");
	}

	test("onKeydown prevented", function(){
		expect(5);

		simple.maxLength = 0;

		simple.onKeydown({
			preventDefault: preventDefault,

			// space
			keyCode: 32
		});

		// prevents extra decimal points
		simple.$el.val( "1." );
		simple.onKeydown({
			preventDefault: preventDefault,

			// `.`
			keyCode: 190
		});

		// prevents extra minus
		simple.$el.val( "-1" );
		simple.allowNegative = true;
		simple.onKeydown({
			preventDefault: preventDefault,

			// `-`
			keyCode: 189
		});

		// prevents extra minus
		simple.el.value = "-1";
		simple.allowNegative = true;
		simple.onKeydown({
			preventDefault: preventDefault,

			// `-`
			keyCode: 189
		});

		simple.onKeydown({
			preventDefault: preventDefault,

			// `1`
			keyCode: 49,
			shiftKey: true
		});
	});

	function notPreventDefault(){
		ok(false, "preventDefault called");
	}

	test("onKeydown not prevented", function(){
		expect(0);

		simple.onKeydown({
			preventDefault: notPreventDefault,
			metaKey: true
		});

		// allows decimals
		simple.allowFloat = true;
		simple.$el.val( "1" );
		simple.onKeydown({
			preventDefault: notPreventDefault,

			// `.`
			keyCode: 190
		});

		// prevents extra minus
		simple.$el.val( "" );
		simple.allowNegative = true;
		simple.onKeydown({
			preventDefault: notPreventDefault,

			// `-`
			keyCode: 189
		});

		simple.onKeydown({
			preventDefault: notPreventDefault,

			// `1`
			keyCode: 49
		});
	});

	function testOnPaste(pasted, value){
		simple.onPaste({
			preventDefault: preventDefault,
			clipboardData: {
				getData: function(){
					return pasted;
				}
			}
		});

		equal(simple.el.value, value);
	}

	test("onPaste", function(){
		// one for prevent default, one for the check
		// the final test doesn't prevent default
		expect(15);
		testOnPaste("123", "123");
		testOnPaste("-1.23", "-1.23");
		testOnPaste("12a3", "123");
		testOnPaste("-123", "-123");
		testOnPaste("-1-23", "-123");
		testOnPaste("-1.2.-3", "-1.23");
		testOnPaste("-.2.-3", "-.23");

		// empty paste values will be ignored
		simple.el.value = "123";
		testOnPaste("", "123");
	});
})(window, shoestring);