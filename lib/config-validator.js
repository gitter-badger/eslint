/**
 * @fileoverview Validates configs.
 * @author Brandon Mills
 * @copyright 2015 Brandon Mills
 */

"use strict";

var rules = require("./rules"),
    schemaValidator = require("is-my-json-valid");

var optionsValidators = Object.create(null);

/**
 * Converts a rule's exported, abbreviated schema into a full schema.
 * @param {object} options Exported schema from a rule.
 * @returns {object} Full schema ready for validation.
 */
function makeRuleOptionsSchema(options) {

    // If no schema, only validate warning level, and permit anything after
    if (!options) {
        return {
            "type": "array",
            "items": [
                {
                    "enum": [0, 1, 2]
                }
            ],
            "minItems": 1
        };
    }

    // Given a tuple of schemas, insert warning level at the beginning
    if (Array.isArray(options)) {
        return {
            "type": "array",
            "items": [
                {
                    "enum": [0, 1, 2]
                }
            ].concat(options),
            "minItems": 1,
            "maxItems": options.length + 1
        };
    }

    // Given a full schema, leave it alone
    return options;
}

/**
 * Gets an options schema for a rule.
 * @param {string} id The rule's unique name.
 * @returns {object} JSON Schema for the rule's options.
 */
function getRuleOptionsSchema(id) {
    var rule = rules.get(id);
    return makeRuleOptionsSchema(rule && rule.schema);
}

/**
 * Validates a rule's options against its schema.
 * @param {string} id The rule's unique name.
 * @param {object} options The given options for the rule.
 * @param {string} source The name of the configuration source.
 * @returns {void}
 */
module.exports.validateRuleOptions = function (id, options, source) {
    var validate = optionsValidators[id],
        message;

    if (!validate) {
        validate = schemaValidator(getRuleOptionsSchema(id), { verbose: true });
        optionsValidators[id] = validate;
    }

    if (typeof options === "number") {
        options = [options];
    }

    validate(options);

    if (validate.errors) {
        message = [
            source, ":\n",
            "\tConfiguration for rule \"", id, "\" is invalid:\n"
        ];
        validate.errors.forEach(function (error) {
            message.push(
                "\tValue \"", error.value, "\" ", error.message, ".\n"
            );
        });

        throw new Error(message.join(""));
    }
};

module.exports.getRuleOptionsSchema = optionsValidators;
