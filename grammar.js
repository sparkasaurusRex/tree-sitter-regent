module.exports = grammar(require('tree-sitter-lua/grammar'), {
  name: 'regent',

  rules: {

    program: $ => repeat(choice(
      $._statement,
      $._regent_statement
    )),

    _regent_statement: $ => choice(
      alias($.fspace_statement, $.fspace),
    ),

    fspace_statement: $ => seq(
      'fspace',
      alias($.identifier, $.fspace_name),
      optional(seq(
        '(',
        commaSep(seq(
          alias($.identifier, $.fspace_argument_name),
          ':',
          alias($.identifier, $.fspace_argument_type)
        )),
        ')'
      )),
      '{',
      sepBy(choice(';', ','), $.fspace_field),
      '}'
    ),

    fspace_field: $ => seq(
      alias($.identifier, $.fspace_field_name),
      ':',
      alias($.identifier, $.regent_type)
    )
  }
})

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule))
}

function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function commaSep(rule) {
  return sepBy(",", rule)
}

function commaSep1(rule) {
  return sepBy1(",", rule)
}
