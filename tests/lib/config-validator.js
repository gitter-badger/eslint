/**
 * @fileoverview Tests for config validator.
 * @author Brandon Mills
 * @copyright 2015 Brandon Mills
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    eslint = require("../../lib/eslint"),
    validator = require("../../lib/config-validator");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

function mockRule(context) {
    return {
        "Program": function(node) {
            context.report(node, "Expected a validation error.");
        }
    };
}

mockRule.schema = [
    {
        "enum": ["single", "double", "backtick"]
    },
    {
        "enum": ["avoid-escape"]
    }
];

describe("Validator", function() {

    describe("validateRuleOptions", function() {

        beforeEach(function() {
            eslint.defineRule("mock-rule", mockRule);
        });

        it("should throw for incorrect warning level", function() {
            var fn = validator.validateRuleOptions.bind(null, "mock-rule", 3, "tests");

            assert.throws(fn, "tests:\n\tConfiguration for rule \"mock-rule\" is invalid:\n\tValue \"3\" must be an enum value.\n");
        });

        it("should only check warning level for nonexistent rules", function() {
            var fn = validator.validateRuleOptions.bind(null, "non-existent-rule", [3, "foobar"], "tests");

            assert.throws(fn, "tests:\n\tConfiguration for rule \"non-existent-rule\" is invalid:\n\tValue \"3\" must be an enum value.\n");
        });

        it("should only check warning level for plugin rules", function() {
            var fn = validator.validateRuleOptions.bind(null, "plugin/rule", 3, "tests");

            assert.throws(fn, "tests:\n\tConfiguration for rule \"plugin/rule\" is invalid:\n\tValue \"3\" must be an enum value.\n");
        });

        it("should throw for incorrect configuration values", function() {
            var fn = validator.validateRuleOptions.bind(null, "mock-rule", [2, "doulbe", "avoidEscape"], "tests");

            assert.throws(fn, "tests:\n\tConfiguration for rule \"mock-rule\" is invalid:\n\tValue \"doulbe\" must be an enum value.\n\tValue \"avoidEscape\" must be an enum value.\n");
        });

        it("should throw for too many configuration values", function() {
            var fn = validator.validateRuleOptions.bind(null, "mock-rule", [2, "single", "avoid-escape", "extra"], "tests");

            assert.throws(fn, "tests:\n\tConfiguration for rule \"mock-rule\" is invalid:\n\tValue \"2,single,avoid-escape,extra\" has more items than allowed.\n");
        });

    });

});
