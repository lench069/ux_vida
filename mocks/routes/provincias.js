const PROVINCIAS = [
	{
		"valor": "2",
		"descripcion": "BUENOS AIRES"
	},
	{
		"valor": "1",
		"descripcion": "CAPITAL FEDERAL"
	},
	{
		"valor": "3",
		"descripcion": "CATAMARCA"
	},
	{
		"valor": "6",
		"descripcion": "CHACO"
	},
	{
		"valor": "7",
		"descripcion": "CHUBUT"
	},
	{
		"valor": "4",
		"descripcion": "CORDOBA"
	},
	{
		"valor": "5",
		"descripcion": "CORRIENTES"
	},
	{
		"valor": "8",
		"descripcion": "ENTRE RIOS"
	},
	{
		"valor": "9",
		"descripcion": "FORMOSA"
	},
	{
		"valor": "10",
		"descripcion": "JUJUY"
	},
	{
		"valor": "11",
		"descripcion": "LA PAMPA"
	},
	{
		"valor": "12",
		"descripcion": "LA RIOJA"
	},
	{
		"valor": "13",
		"descripcion": "MENDOZA"
	},
	{
		"valor": "14",
		"descripcion": "MISIONES"
	},
	{
		"valor": "15",
		"descripcion": "NEUQUEN"
	},
	{
		"valor": "16",
		"descripcion": "RIO NEGRO"
	},
	{
		"valor": "17",
		"descripcion": "SALTA"
	},
	{
		"valor": "18",
		"descripcion": "SAN JUAN"
	},
	{
		"valor": "19",
		"descripcion": "SAN LUIS"
	},
	{
		"valor": "20",
		"descripcion": "SANTA CRUZ"
	},
	{
		"valor": "21",
		"descripcion": "SANTA FE"
	},
	{
		"valor": "22",
		"descripcion": "SANTIAGO DEL ESTERO"
	},
	{
		"valor": "23",
		"descripcion": "TIERRA DEL FUEGO"
	},
	{
		"valor": "24",
		"descripcion": "TUCUMAN"
	},
];

module.exports = [
	{
		id: "get-provincias",
		url: "/api/provincias",
		method: "GET",
		variants: [
			{
				id: "success",
				response: {
					status: 200,
					body: PROVINCIAS,
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