var date=document.querySelector("#date");
var buttonLE=document.querySelector("#buttonMLE");
	if(date!=null){
		date.addEventListener("change",function() {
		if(this.value.localeCompare(String(new Date().toJSON().slice(0,10)))==1)
		{
			buttonLE.disabled=false;
		}
		else
		{
			alert("Must be greater than current date");
			buttonLE.disabled=true;
		}
		});

	}
		