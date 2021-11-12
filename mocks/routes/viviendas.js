const VIVIENDAS = [
	{ "valor": "1", "descripcion": "CASA" },
	{ "valor": "2", "descripcion": "DEPARTAMENTO" },
	{ "valor": "3", "descripcion": "COUNTRY / BARRIO CERRADO" },
	{ "valor": "4", "descripcion": "PH" }
];

module.exports = [
	{
		id: "get-viviendas",
		url: "/api/viviendas",
		method: "GET",
		variants: [
			{
				id: "success",
				response: {
					status: 200,
					body: VIVIENDAS,
				},
			},
			{
				id: "error",
				response: {
					status: 400,
					body: {
						message: "Error",
					},
				},
			},
		],
	},
];
