const name = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const shopName = document.getElementById("shopName")
const shopAddress = document.getElementById("shopAddress");
const mobail = document.getElementById("mobail");
const telephone = document.getElementById("telephone");
const extraDays = document.getElementById("extraDays");
const exDate = document.getElementById("monthsSubscription");
const extraProduct = document.getElementById("extraProduct");
const brief = document.getElementById("brief");
const imgErr = document.getElementById("imgErr");
let fIn = document.getElementById("file-input");

const form = document.getElementById("form");
const input = document.querySelector(".inpute2")
var emailReg = /^([a-z0-9]+(@gmail.com))$/;


form.onsubmit = function(e){
    var flag = form.getAttribute('data-flag');
    if(flag == 0){
        e.preventDefault(); //to prevent submitting
        //get FieldName
        function getFieldName(input) {
            return input.id.charAt(0).toUpperCase() + input.id.slice(1);
        }

        function checkUserName(input) {
            if(input.value.trim() === ''){
                showError(input,`${getFieldName(input)} is required`)
            }else {
                checkEmail(input);
            }
        }
        //check email is valid
        function checkEmail(input) {
            const re = emailReg;
            if(re.test(input.value.trim())) {
                showSucces(input)
            }else {
                showError(input,'Email is not invalid');
            }
        }
        function checkpassword(input,input2) {
            if(input.value.trim() === ''){
                showError(input,`${getFieldName(input)} is required`)
            }else {
                checkPasswordLength(input,8,12,input2)
            }
        }
        //check input Length
        function checkPasswordLength(input, min ,max,input2) {
            if(input.value.length < min) {
                showError(input, `${getFieldName(input)} must be at least ${min} characters`);
            }else if(input.value.length > max) {
                showError(input, `${getFieldName(input)} must be les than ${max} characters`);
            }else {
                showSucces(input)
                if(input2.value.trim() === ''){
                    showError(input2,`${getFieldName(input2)} is required`)
                }else{
                    checkPasswordMatch(input,input2);
                }
                function checkPasswordMatch(input, input2) {
                    if(input.value !== input2.value) {
                        showError(input2, `${getFieldName(input2)} Passwords do not match`);
                    }else{
                        showSucces(input2)
                    }
                }
                
            }
        }
        //show success colour
        function showSucces(input) {
            input.style.border = "2px solid #2ecc71";
            const formControl = input.parentElement;
            formControl.className = 'form-control';
            const dd = formControl.querySelector('.text_error');
            dd.style.visibility = "hidden";
        }
        //Show input error messages
        function showError(input, message) {
            const formControl = input.parentElement;
            formControl.className = 'form-control';
            const small = formControl.querySelector('small');
            const dd = formControl.querySelector('.text_error');
            dd.style.visibility = "visible";
            input.style.border = "2px solid rgb(249 61 61)";
            small.innerText = message;
        }

        function checkNumberFild(inputArr) {
            inputArr.forEach(function(input){
                if(input.value.trim() === ''){
                    showError(input,`${getFieldName(input)} is required`)
                }else {
                    checkNumber(input);
                }
            });
        }

        function checkNumber(input) {
            var regex=/^[0-9]+$/;
            if(!input.value.match(regex)){
                showError(input,`Must input numbers`)
            }else{
                if(getFieldName(input) == 'Mobail'){
                    checkLength(input,9,11);
                }else if(getFieldName(input) == 'Telephone'){
                    checkLength(input,4,7); 
                }else if(getFieldName(input) == 'ExtraDays'){
                    checkLength(input,0,31);
                }
                else if(getFieldName(input) == 'MonthsSubscription'){
                    checkLength(input,0,12);
                }
                else if(getFieldName(input) == 'ExtraProduct'){
                    checkLength(input,0,30);
                }
            }
        }

        function checkText(inputArr) {
            inputArr.forEach(function(input){
                if(input.value.trim() === ''){
                    showError(input,`${getFieldName(input)} is required`)
                }else {
                    checkLength(input,2,12);
                }
            });
        }
        //check input Length
        function checkLength(input, min ,max) {
            if(input.value.length <= min) {
                showError(input, `${getFieldName(input)} must be greater than ${min} `);
            }else if(input.value.length > max) {
                showError(input, `${getFieldName(input)} must be les than ${max} `);
            }else {
                showSucces(input);
            }
        }
        
        if(fIn.files.length == 0){
            imgErr.style.visibility = "visible";
            imgErr.innerText = `${fIn.files.length} Images Selected "You must add a image"`;
        }else if(fIn.files.length > 1){
            imgErr.style.visibility = "visible";
            imgErr.innerText = `${fIn.files.length} Images Selected "You cannot add more than one image"`;
        }else if(fIn.files.length == 1){
            imgErr.style.visibility = "hidden";
        }
        checkUserName(name);
        checkpassword(password,confirmPassword);
        checkText([shopName,shopAddress]);
        checkNumberFild([mobail,telephone,extraDays,exDate,extraProduct]);

        checkErrors([name,password,confirmPassword,shopName,shopAddress,mobail,telephone,extraDays,exDate,extraProduct])
        function checkErrors(inputArr) {
            var count=0;
            inputArr.forEach(function(input){
                const formControl = input.parentElement;
                const small = formControl.querySelector('small');
                if(small.innerText ==''|| small.innerText == null){
                    count++;
                    if(count == 10 && fIn.files.length == 1){
                        Swal.fire({
                        title: 'Do you want to save the Customer?',
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Save',
                        denyButtonText: `Don't save`,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                form.setAttribute('data-flag', '1');
                                form.submit();
                                Swal.fire('Saved!', '', 'success')
                            } else if (result.isDenied) {
                                e.preventDefault();
                                Swal.fire('Changes are not saved', '', 'info')
                            }
                        })
                    }
                    
                }else{}
            })
        }
    }
    return true;
};