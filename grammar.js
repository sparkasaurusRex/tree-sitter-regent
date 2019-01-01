module.exports = grammar(require('tree-sitter-lua/grammar'), {
  name: 'regent',

  // conflicts: $ => [
  //   [$._regent_type, $.fspace_identifier]
  // ],

  rules: {

    _statement: $ => choice(
      alias($._expression, $.expression),

      $.variable_declaration,
      $.local_variable_declaration,

      $.do_statement,
      $.if_statement,
      $.while_statement,
      $.repeat_statement,
      $.for_statement,
      $.for_in_statement,

      $.goto_statement,
      $.break_statement,

      $.label_statement,
      $._empty_statement,

      alias($.function_statement, $.function),
      alias($.local_function_statement, $.local_function),
      alias($.function_call_statement, $.function_call),

      $._regent_statement
    ),

    _expression: $ => choice(
      $.spread,
      $._prefix,

      $.next,

      $.function_definition,

      $.table,

      $.binary_operation,
      $.unary_operation,

      $.string,
      $.number,
      $.nil,
      $.true,
      $.false,
      $.identifier,

      $._regent_expression
    ),

    _regent_statement: $ => choice(
      alias($.task_statement, $.task),
      alias($.terra_statement, $.terra),
      alias($.fspace_statement, $.fspace),
      alias($.struct_statement, $.struct),
      $.var_statement,
      $.copy_statement,
      $.fill_statement
    ),

    _regent_expression: $ => choice(
      alias($.ispace_expression, $.ispace),
      // alias($.region_expression, $.region),
      alias($.partition_expression, $.partition),
      alias($.image_expression, $.image),
      alias($.preimage_expression, $.preimage),
      // __demand
      // __forbid
    ),

    partition_expression: $ => seq(
      'partition',
      '(',
      optional(seq(choice('equal', 'disjoint', 'aliased'), ',')),
      commaSep1($._expression),
      ')'
    ),

    image_expression: $ => seq(
      'image',
      '(',
      commaSep1($._expression),
      ')'
    ),

    preimage_expression: $ => seq(
      'preimage',
      '(',
      commaSep1($._expression),
      ')'
    ),

    _regent_type: $ => choice(
      $.regent_primitive_type,
      $.region_type,
      $.ptr_type,
      // $.ispace_type,
      // $.fspace_identifier,
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
      // optional(seq( // TODO
        '(',
        $._regent_type,
        ',',
        $.region_field_identifier, // TODO: Do I always need this?
        ')'
      // ))
    ),

    ispace_expression: $ => seq(
      'ispace',
      '(',
      $._regent_type,
      ',',
      choice(
        $.number,
        commaSep1(seq(
          '{',
          commaSep1($.number),
          '}'
        ))
      ),
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

    terra_statement: $ => seq(
      'terra',
      alias($.identifier, $.name),
      '(',
      commaSep(alias($.task_parameter, $.terra_parameter)),
      ')',
      repeat($._statement),
      optional($.return_statement),
      'end'
    ),

    task_statement: $ => seq(
      optional(alias($.task_annotation, $.annotation)),
      'task',
      alias($.identifier, $.name),
      '(',
      commaSep($.task_parameter),
      ')',
      optional(seq(':', $._regent_type)),
      optional(seq(
        'where',
        commaSep1(choice(
          $.task_privilege,
          $.task_constraint
        )),
        'do'
      )),
      repeat($._statement),
      optional($.return_statement),
      'end'
    ),

    task_annotation: $ => seq(
      choice('__demand', '__forbid'),
      '(',
      choice(
        '__leaf',
        '__inner',
        '__idempotent',
        '__replicable',
        '__inline'
      ),
      ')'
    ),

    task_parameter: $ => seq(
      alias($.identifier, $.name),
      ':',
      $._regent_type
    ),

    task_privilege: $ => seq(
     repeat(choice(
       // Privileges
       'reads',
       'writes',
       seq('reduces', choice('+', '*', '-', '/', 'min', 'max')),
       // Coherences
       'exclusive',
       'atomic',
       'simultaneous',
       'relaxed'
     )),
     '(',
     commaSep1($.region_field_identifier),
     ')'
    ),

    task_constraint: $ => seq(
     $.region_field_identifier,
     choice('*', '<='),
     $.region_field_identifier
    ),

    region_field_identifier: $ => seq(
     $.identifier,
     repeat(seq('.', $.identifier)),
     optional(seq('.', '{', commaSep1($.identifier), '}'))
    ),

    fspace_statement: $ => seq(
      'fspace',
      alias($.identifier, $.name),
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
      alias($.identifier, $.name),
      ':',
      $._regent_type
    ),

    struct_statement: $ => seq(
      'struct',
      alias($.identifier, $.name),
      '{',
      sepBy(choice(';', ','), alias($.fspace_field, $.struct_field)),
      '}'
    ),

    // fspace_identifier: $ => seq(
    //   alias($.identifier, $.name),
    //   '(',
    //   commaSep1($._expression),
    //   ')'
    // ),

    var_statement: $ => seq(
      'var',
      alias($.identifier, $.name),
      optional(seq(':', $._regent_type)),
      '=',
      $._expression
    ),

    copy_statement: $ => seq(
      'copy',
      '(',
      $.region_field_identifier,
      ',',
      $.region_field_identifier,
      ')'
    ),

    fill_statement: $ => seq(
      'fill',
      '(',
      $.region_field_identifier,
      ',',
      $._expression,
      ')'
    ),


    wild: $ => 'wild' // TODO: Figure out where to use this
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
