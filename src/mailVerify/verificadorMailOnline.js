function verificarMailOnline(email) {
	var emailVerificar = $(email).val();
	var resp = llamarVerificadorOnline(token, numeroDocumento, tipoDocumento, emailVerificar);
	if (resp.valido) {
		$(control).removeClass("email-invalido");
		$(control).addClass("email-valido");
	} else {
		$(control).addClass("email-invalido");
		$(control).removeClass("email-valido");
	}
	return resp;
}

function llamarVerificadorOnline(email) {
	var resp = true;
	$.ajax({
        url: "/mailVerify.do",
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: "mail=" + email,
        async: false,
        cache: false,
        success: function (data) {
            if (data.codigoRespuesta == 0) {
            	if (data.mensaje == "Valido") {
            		resp = true;
            	} else {
            		resp = false;
            	}
            } else {
            	resp = true;
            }
        },error: function (request, status, error) {
        	resp=true;
        }
    });
    return resp;
}

$(document).ready(function() {
	$(".validar-email").blur(function() {
		var resp = verificarMailOnline(this);
		console.log(resp);
	});

});
