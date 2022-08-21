
function Validator(selector) {
  const _this = this;
  const formElement = document.querySelector(selector);
  const formRules = {};

  // Object chứa các function để test validate
  const validatorRules = {
    required: function(value) {
      return value.trim() ? undefined : 'This field is required.';
    },
    email: function(value) {
      const regexEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regexEmailPattern.test(value) ? undefined : 'Your have entered an invalid email address!'
    },
    min: function(min) {
      return function(value) {
        return value.length >= min ? undefined : `This field must be at least ${min} characters.`
      }
    }
  }

  // lấy ra parentElement của input
  function getParent(element, selector) {
    if (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  if (formElement) {
    const inputs = formElement.querySelectorAll('[name][rules]');
    
    for (let input of inputs) {
      if (input.getAttribute('rules')) {
        const rules = input.getAttribute('rules').split('|');
        let isRuleHasValue = false;
        let ruleFunc;
        for (let rule of rules) {
          let ruleArray;
          if (rule.includes(':')) {
            ruleArray = rule.split(':');
            rule = ruleArray[0];
            isRuleHasValue = true;
          }
          ruleFunc = validatorRules[rule];
          if (isRuleHasValue) {
            ruleFunc = validatorRules[rule](ruleArray[1])
          }
          if (!Array.isArray(formRules[input.name])) {
            formRules[input.name] = []
          }
          formRules[input.name].push(ruleFunc)  
        }
      }

      // Lắng nghe các sự kiện của các input
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    formElement.addEventListener('submit', handleSubmit)
  }

  // Xử lý sự kiện submit
  function handleSubmit (event) {
    const inputs = formElement.querySelectorAll('[name][rules]');
    let isValid = true;
    
    event.preventDefault()

    for (let input of inputs) {
      if (handleValidate({target: input})) {
        isValid = false;
      }
    }
    if (isValid) {
      if (typeof _this.onSubmit === 'function') {
        const enableInputs = formElement.querySelectorAll('[name][rules]');
        let isCheck = false;
        let formValues =
        Array.from(enableInputs).reduce(function(values, input) {
          switch (input.type) {
            case 'radio':
            case 'checkbox':
              if (input.matches(':checked')) {
                isCheck = true;
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                if (!isCheck) {
                  values[input.name] = '';
                }
              }
              break;
            default:
              values[input.name] = input.value; 
          }
          return values;
        }, {});
        
        _this.onSubmit(formValues)
      } else {
        formElement.submit();
      }
    }
  }

  // Xử lý clear error message khi nhập input
  function handleClearError(event) {
    const formGroup = getParent(event.target, '.form-group');

    if (formGroup) {
      const formMessage = formGroup.querySelector('.form-message');
      if (formGroup.classList.contains('invalid')) {
        formMessage.innerText = '';
        formGroup.classList.remove('invalid')
      }
    }
  }
  // Xử lý validate cho sự kiện blur
  function handleValidate(event) {
    const formGroup = getParent(event.target, '.form-group');
    let errorMessage;

    if (formGroup) {
      const formMessage = formGroup.querySelector('.form-message');
      const rules = formRules[event.target.name];
      for (let rule of rules) {
        errorMessage = rule(event.target.value);
        if (errorMessage) break;
      }
      if (errorMessage) {
        formMessage.innerText = errorMessage;
        formGroup.classList.add('invalid')
      }
    }
    return errorMessage;
  }
}


/** 1. Tạo Validator function
 * 2. sử dụng attribute syntax rules="rule|otherrule:rulevalue"
 * validate các input
 * tạo object chứa các hàm kiểm tra value
 * tạo object chứa tất cả các rules cho form formRules
 * sử dụng hàm handleValidate để xử lý sự kiện blur
 * sử dụng hàm handleClearError để xử lý khi nhập input
 * sử dụng hàm handleSubmit để xử lý sự kiện submit
 * sử dụng hàm onSubmit để nhận FormValues từ các input để pv cho
 *  call Api
 */