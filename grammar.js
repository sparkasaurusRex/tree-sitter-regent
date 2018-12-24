module.exports = grammar(require('tree-sitter-lua/grammar'), {
  name: 'regent',

  rules: {

    program: $ => repeat(choice(
      $._statement,
      $._regent_statement
    )),

    _regent_statement: $ => choice(
      // alias($.task_statement, $.task),
      // alias($.terra_statement, $.terra),
      alias($.fspace_statement, $.fspace),
      // alias($.struct_statement, $.struct),
      // TODO: var x = ...
      // $.copy_statement,
      // $.fill_statement
    ),

    // _regent_expression: $ => choice(
    //   $.ispace,
    //   $.region,
    //   // Partition ops
    //   // __demand
    //   // __forbid
    // ),

    _regent_type: $ => choice(
      $.regent_primitive_type,
      $.region_type,
      $.ptr_type,
      // $.ispace_type,
      alias($.identifier, $.type_identifier)
    ),

    region_type: $ => seq(
      'region',
      '(',
      $._regent_type,
      ')'
    ),

    ptr_type: $ => seq(
      'ptr',
      '(',
      $._regent_type,
      ',',
      alias($.identifier, $.region_identifier), // TODO: Do I always need this?
      ')'
    ),

    regent_primitive_type: $ => choice(
      'bool',
      ...['', 8, 16, 32].map(n => `int${n}`),
      ...['', 8, 16, 32].map(n => `uint${n}`),
      'float',
      'double',
      ...[1, 2, 3].map(n => `int${n}d`),
      ...[1, 2, 3].map(n => `rect${n}d`)
    ),

    // task_statement: $ => seq(
    //   'task',
    //   alias($.identifier, $.task_name),
    //   '(',
    //   ')',
    //   'return',
    //   'true',
    //   'end'
    // ),

    fspace_statement: $ => seq(
      'fspace',
      alias($.identifier, $.fspace_name),
      optional(seq(
        '(',
        commaSep($.fspace_argument),
        ')'
      )),
      '{',
      sepBy(choice(';', ','), $.fspace_field),
      '}'
    ),

    fspace_argument: $ => seq(
      alias($.identifier, $.name),
      ':',
      $._regent_type
    ),

    fspace_field: $ => seq(
      alias($.identifier, $.fspace_field_name),
      ':',
      $._regent_type
    ),

    wild: $ => 'wild' // TODO: Figure out where to use
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
