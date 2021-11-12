

// funcion que valida que una direccion de email sea correcta
// admite direcciones estilo: nombre@dominio.com  o nombre@[ip]
function verificarMail(emailStr)   {
   // verifica si el email tiene el formato user@dominio
   var emailPat = /^(.+)@(.+)$/;
   // verifica la existencia de caracteres. ( ) < > @ , ; : \ " . [ ]
   var specialChars = "\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
   // verifica los caracteres que son validos en una direcci�n de email
   var validChars = "\[^\\s" + specialChars + "\]";
   var quotedUser="(\"[^\"]*\")"; 
   // verifica si la direcci�n de email esta representada con una direcci�n IP valida
   var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
   // verifica caracteres invalidos
   var atom=validChars + '+';
   var word="(" + atom + "|" + quotedUser + ")";
   var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
   var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$");
   var matchArray=emailStr.match(emailPat);
   
   if (matchArray==null) {
      return false;
   }
   
   var user=matchArray[1];
   var domain=matchArray[2];
   
   // si el usuario "user" no es valido 
   if (user.match(userPat)==null) {
      return false;
   }
   
   // si la direcci�n IP es valida
   var IPArray=domain.match(ipDomainPat);
   if (IPArray!=null) {
      for (var i=1;i<=4;i++) {
         if (IPArray[i]>255) {
            return false; }
      }
      return true;
   }
   
   var domainArray=domain.match(domainPat);
   if (domainArray==null) {
      return false;
   }
   
   var atomPat=new RegExp(atom,"g");
   var domArr=domain.match(atomPat);
   var len=domArr.length;
   if (domArr[domArr.length-1].length<2 || domArr[domArr.length-1].length>3) { 
      return false;
   }
   
   if (len<2) {
      
      return false;
   }
   
   //se agrega el codigo par validacion de mail
	if(!llamarVerificadorOnline(emailStr)){
		   return false;
	   } 
   
   // la direccion de email ingresada es valida
   return true;
}
