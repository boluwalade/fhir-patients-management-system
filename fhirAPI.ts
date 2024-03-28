import axios from 'axios';

export const fhirBaseUrl = "https:/hapi.fhir.org/baseR4/" //http://localhost:8080/fhir/

export const fhirAPI= axios.create({baseURL : fhirBaseUrl, headers: {'Cache-Control': 'no-cache'}})
//cache control url: https://hapifhir.io/hapi-fhir/docs/server_jpa/configuration.html