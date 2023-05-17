//console.log('hello');

//add locat GMT to date string 
function addLocalGMT2Date(dt)
{
    let d = moment.utc(dt).utcOffset(moment().utcOffset());
    return d.format('YYYY-MM-DD HH:mm:ss');
}
//remove elements from DOM 
function removeElements(sels)
{
  let elms = document.querySelectorAll(sels);
  elms.forEach(el => el.remove());
}

//remove toast
function removeToast(itm)
{
  itm.parentNode.parentNode.removeChild(itm.parentNode);
  console.log(itm);
}  
//create toast
function createToast(text)
{
  let div = document.createElement("div");
  let div1 = document.createElement("div");
  let div2 = document.createElement("div");
  div.classList.add('alert-danger');
  div1.textContent = text;
  div2.innerHTML = '&times;' 
  div2.addEventListener('click', e =>{

  e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      console.log(e);
  });
  div.appendChild(div1);
  div.appendChild(div2);
  return div;
}