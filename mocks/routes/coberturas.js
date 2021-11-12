const GRUPOCOBERTURAS = [
	{
		"name": 'Coverturas de incendios y consecuencias asociadas al mismo.',
		"description": 'Incendio de tu vivienda.',
		"coberturas": [
			{
				"deCobertura": 'Incendio del edificio',
				"mtSumaMinima": '150000',
				"mtSumaMaxima": '200000',
				"mtSumaAsegurada": '160000',
				"deCoberturaLarga": 'En caso de incendio le cubrimos los bienes muebles que tiene el cliente dentro del inmueble.'
			},
			{
				"deCobertura": 'Incendio del contenido',
				"mtSumaMinima": '100000',
				"mtSumaMaxima": '300000',
				"mtSumaAsegurada": '180000',
				"deCoberturaLarga": 'En caso de incendio del contenido le cubrimos los bienes muebles del inmueble.'
			},
			{
				"deCobertura": 'Incendio - Remoción de esconbros',
				"mtSumaMinima": '190000',
				"mtSumaMaxima": '190000',
				"mtSumaAsegurada": '190000',
				"deCoberturaLarga": 'En caso de incendio le cubrimos los bienes muebles de remoción de esconbros.'
			},
			{
				"deCobertura": 'Gastos de hospedaje',
				"mtSumaMinima": '190000',
				"mtSumaMaxima": '800000',
				"mtSumaAsegurada": '220000',
				"deCoberturaLarga": 'En caso de incendio le cubrimos los bienes muebles que tiene el cliente dentro del hospedaje.'
			}
		]
	},
	{
		"name": 'coberturas por robo en su vivienda e ¡inclusive en vacaciones.!',
		"description": '',
		"coberturas": [
			{
				"deCobertura": 'Robo de inmueble',
				"mtSumaMinima": '170000',
				"mtSumaMaxima": '170000',
				"mtSumaAsegurada": '170000',
				"deCoberturaLarga": 'En caso de robo le cubrimos los bienes muebles dentro del inmueble.'
			},
			{
				"deCobertura": 'Gastos médicos por robo',
				"mtSumaMinima": '90000',
				"mtSumaMaxima": '200000',
				"mtSumaAsegurada": '140000',
				"deCoberturaLarga": ''
			},
			{
				"deCobertura": 'Muerte en robo',
				"mtSumaMinima": '160000',
				"mtSumaMaxima": '210000',
				"mtSumaAsegurada": '190000',
				"deCoberturaLarga": 'En caso de robo en el inmueble el/los asegurados reciben un bono.'
			}
		]
	},
	{
		"name": 'Cobertura responsabilidad civil y otros.',
		"description": 'Incendio de tu vivienda.',
		"coberturas": [
			{
				"deCobertura": 'Cobertura',
				"mtSumaMinima": '300000',
				"mtSumaMaxima": '900000',
				"mtSumaAsegurada": '500000',
				"deCoberturaLarga": 'En caso de cobertura recibe la cantidad establecida.'
			},
			{
				"deCobertura": 'Responsabilidad civil y otros',
				"mtSumaMinima": '800000',
				"mtSumaMaxima": '800000',
				"mtSumaAsegurada": '800000',
				"deCoberturaLarga": 'En caso de responsabilidad civil y otros cantidad sugerida.'
			}
		]
	}
];

module.exports = [
	{
		id: "get-coberturas",
		url: "/api/coberturas",
		method: "GET",
		variants: [
			{
				id: "success",
				response: {
					status: 200,
					body: GRUPOCOBERTURAS,
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
