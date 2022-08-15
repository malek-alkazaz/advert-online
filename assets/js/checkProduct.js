
  
    const form = document.getElementById("form");
    let fIn = document.getElementById("file-input");
    const name = document.getElementById("name");
    const price = document.getElementById("price");
    const description = document.getElementById("description");

    
    form.onsubmit = function(e){
      var flag = form.getAttribute('data-flag');
      if(flag == 0){
          e.preventDefault(); //to prevent submitting
  
          function getFieldName(input) {
              return input.id.charAt(0).toUpperCase() + input.id.slice(1);
          }
  
          function checkInput(inputArr) {
            inputArr.forEach(function(input){
                if(input.value.trim() === ''){
                    showError(input,`${getFieldName(input)} is required`)
                }else{
                  showSucces(input)
                }
            });
          }
  
          //show success colour
          function showSucces(input) {
              input.style.border = "2px solid #2ecc71";
              const formControl = input.parentElement;
              formControl.className = 'product-form-control';
              const dd = formControl.querySelector('.text_error');
              dd.style.visibility = "hidden";
          }
          //Show input error messages
          function showError(input, message ,description) {
              const formControl = input.parentElement;
              formControl.className = 'product-form-control';
              const small = formControl.querySelector('small');
              const dd = formControl.querySelector('.text_error');
              dd.style.visibility = "visible";
              input.style.border = "2px solid rgb(249 61 61)";
              small.innerText = message;
          }
  
          checkInput([name,price,description]);
          if(fIn.files.length == 0){
              imgErr.style.visibility = "visible";
              imgErr.innerText = `${fIn.files.length} Images Selected "You must add a image"`;
          }else if(fIn.files.length > 5){
              imgErr.style.visibility = "visible";
              imgErr.innerText = `${fIn.files.length} Images Selected "You cannot add more than 5 images"`;
          }else if(fIn.files.length < 5 || fIn.files.length > 0){
              imgErr.style.visibility = "hidden";
          }
  
          checkErrors([name,price]);
          function checkErrors(inputArr) {
              var count=0;
              inputArr.forEach(function(input){
                  const formControl = input.parentElement;
                  const small = formControl.querySelector('small');
                  if(small.innerText ==''|| small.innerText == null){
                      count++;
                      if(count == 10 && fIn.files.length == 1){
                          Swal.fire({
                          title: 'Do you want to save the Product?',
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
      return false;
    }