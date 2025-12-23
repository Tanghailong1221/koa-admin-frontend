/**
 * 表单验证翻译
 */

export default {
    required: '{field}不能为空',
    email: '请输入正确的邮箱地址',
    phone: '请输入正确的手机号',
    url: '请输入正确的URL地址',
    number: '请输入数字',
    integer: '请输入整数',
    min: '{field}不能小于{min}',
    max: '{field}不能大于{max}',
    minLength: '{field}长度不能小于{min}个字符',
    maxLength: '{field}长度不能大于{max}个字符',
    length: '{field}长度必须为{length}个字符',
    pattern: '{field}格式不正确',
    same: '{field}必须与{target}相同',
    different: '{field}不能与{target}相同',
    in: '{field}必须是{values}中的一个',
    notIn: '{field}不能是{values}中的一个',
    unique: '{field}已存在',
    exists: '{field}不存在',
    date: '请输入正确的日期',
    dateFormat: '日期格式不正确',
    before: '{field}必须在{date}之前',
    after: '{field}必须在{date}之后',
    between: '{field}必须在{min}和{max}之间',
    confirmed: '两次输入不一致',
    alpha: '{field}只能包含字母',
    alphaNum: '{field}只能包含字母和数字',
    alphaDash: '{field}只能包含字母、数字、下划线和破折号',
    idCard: '请输入正确的身份证号',
    strongPassword: '密码必须包含大小写字母、数字和特殊字符，且长度不少于8位'
}
