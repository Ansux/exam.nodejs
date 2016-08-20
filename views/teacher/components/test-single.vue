<template lang="jade">
  .form-group
    label.col-sm-2.label-control 题目
    .col-sm-10
      input.form-control(v-model="testForm.title")
  //- 单选题
  .options.divider
    .form-group(v-for="item in testAttrs.options_1")
      label.col-sm-2.label-control(v-text="item.key")
      .col-sm-10
        input.form-control(v-model="item.val")
  .result.divider
    .form-group
      label.col-sm-2.label-control 答案
      .col-sm-10
        //- 单选题
        .single
          label.radio-inline(v-for="item in testAttrs.options_1")
            input(type="radio",name="result",v-bind:value="item.key",v-model="testForm.result")
            | {{item.key}}
  .analyze.divider
    .form-group
      label.col-sm-2.label-control 解析
      .col-sm-10
        input.form-control(v-model="testForm.analyze")
</template>