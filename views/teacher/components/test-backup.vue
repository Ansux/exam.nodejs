<template>
  .form-group
    label.col-sm-2.label-control 题目
    .col-sm-10
      input.form-control(v-model="testForm.title")
  //- 单选题
  .options.divider(v-if="testAttrs.type.name==='单选题'")
    .form-group(v-for="item in testAttrs.options_1")
      label.col-sm-2.label-control(v-text="item.key")
      .col-sm-10
        input.form-control(v-model="item.val")
  //- 判断题
  .options.divider(v-if="testAttrs.type.name==='判断题'")
    .form-group(v-for="item in testAttrs.options_2")
      label.col-sm-2.label-control(v-text="item.key")
      .col-sm-10
        input.form-control(v-model="item.val")
  //- 多选题
  .options.divider(v-if="testAttrs.type.name==='多选题'")
    .form-group(v-for="item in testAttrs.options_1")
      label.col-sm-2.label-control(v-text="item.key")
      .col-sm-10
        input.form-control(v-model="item.val")
  .result.divider
    .form-group
      label.col-sm-2.label-control 答案
      .col-sm-10
        //- 单选题
        .single(v-if="testAttrs.type.name==='单选题'")
          label.radio-inline(v-for="item in testAttrs.options_1")
            input(type="radio",name="result",v-bind:value="item.key",v-model="testForm.result")
            | {{item.key}}
        //- 判断题
        .true-false(v-if="testAttrs.type.name==='判断题'")
          label.radio-inline(v-for="item in testAttrs.options_2")
            input(type="radio",name="result",v-bind:value="item.key",v-model="testForm.result")
            | {{item.key}}
        //- 多选题
        .multiple(v-if="testAttrs.type.name==='多选题'")
          label.radio-inline(v-for="item in testAttrs.options_1")
            input(type="checkbox",v-bind:value="item.key",v-model="testForm.result")
            | {{item.key}}
  .analyze.divider
    .form-group
      label.col-sm-2.label-control 解析
      .col-sm-10
        input.form-control(v-model="testForm.analyze")
</template>