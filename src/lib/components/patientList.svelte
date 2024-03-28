<script lang="ts">
  // Import necessary modules
  import { fhirAPI } from '../../../fhirAPI'; // Import the FHIR API module
  import type { Patient } from 'fhir/r4'; // Import the Patient type from FHIR
  import clsx from 'clsx'; // Import the clsx utility for conditional classes

  // Declare variables
  let currentPage = 0; // Variable to track the current page number
  let pageCount = 10; // Variable to count the number of patients per page
  let searchTerm: string = ''; // Variable to store the search term
  let timer: NodeJS.Timeout; // Timer for debouncing search input

  // Debounce function to delay search until user stops typing
  const debounce = (inputElement: HTMLInputElement | null) => {
    clearTimeout(timer); // Clear previous timeout
    if (inputElement) {
      timer = setTimeout(() => {
        searchTerm = inputElement.value; // Set search term after debounce interval
        getPatients(currentPage, searchTerm); // Fetch patients based on search term
      }, 500); // Debounce interval
    }
  }

  // Function to check if the search term is a phone number
  const isPhoneNumber = (searchTerm: string) => {
    return /^\d+$/.test(searchTerm); // Use regex to check if the search term consists only of digits
  }

  // Function to fetch patients from the FHIR server
  const getPatients = async (currentPage: number, searchTerm: string) => {
    let searchParams: {
      name?: string | undefined,
      telecom?: string | undefined
    } = {};

    if (searchTerm) { // Check if search term is provided
      if (isPhoneNumber(searchTerm)) { // If search term is a phone number
        searchParams.telecom = searchTerm; // Set search parameter for phone number
      } else { // If search term is not a phone number (treated as name search)
        searchParams.name = searchTerm; // Set search parameter for name
      }
    }

    try {
      // Make request to FHIR server to fetch patients
      const response = await fhirAPI.get('Patient', {
        params: {
          _sort: '-_lastUpdated', // Sort patients by last updated
          _count: pageCount, // Number of patients to fetch per page
          _getpagesoffset: currentPage * pageCount, // Offset based on current page
          _total: 'accurate',// returns the number of patients in the server 
          ...searchParams // Include search parameters in request
        }
      });
      const patients = response.data; // Extract patient data from response
      pageCount = patients.entry.length; // Update pageCount based on the actual number of patients returned
      console.log(patients)
      return patients; // Return fetched patients
    } catch (error) {
      console.error('Error fetching patients:', error); // Log error if fetching patients fails
      return null; // Return null in case of error
    }
  }

  // Function to format patient's name
  const formatName = (resource: Patient) => {
    const nameElement = resource.name?.[0];
    const lastName = nameElement?.family;
    const firstName = nameElement?.given?.join(' ');

    if (lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName;
  }
</script>

<!-- Svelte code -->
<main class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-4">Patient Management</h1>
  <div class="flex flex-wrap justify-between w-full">
    <input on:keyup={(e) => debounce(e.target)} type="text" class="w-3/4 border rounded p-2 mb-4" placeholder="Search with name or phone number">
    <button class="w-1/5 p-2 text-white bg-blue-500 hover:bg-blue-600 rounded"><a href="/Patient">Create Patient</a></button>
  </div>
  <div class="flex flex-col space-y-4">
    {#await getPatients(currentPage, searchTerm)}
      <p class="text-gray-600">Loading...</p>
    {:then patients}
      {#if patients.total === 0}
        <p class="text-gray-600">No patients found.</p>
      {:else}
        {#each patients.entry as patient }
          <a href={`/Patient/${patient?.resource?.id}`} class="bg-white hover:bg-gray-100 rounded-md shadow-md p-4 transition-colors duration-300">
            <div class="flex items-center justify-between">
              <div class="text-lg font-semibold">{formatName(patient.resource)}</div>
              <div class="text-gray-500 italic">ID : {patient.resource?.id}</div>
            </div>
            <div class="text-sm text-gray-600 mt-1">{patient.resource?.birthDate}</div>
            <div class="text-md">{patient.resource?.gender}</div>
          </a>
        {/each}
      {/if}
    {:catch error}
      <p class="text-red-500">Error fetching patients: {error.message}</p>
    {/await}
  </div>
  <div class="flex justify-between mt-4">
    <button class={clsx("p-2 text-white rounded", {
      "bg-gray-500": currentPage == 0,
      "bg-blue-500 hover:bg-blue-600": currentPage != 0
    })} on:click={() => currentPage--} disabled={currentPage == 0}>Previous</button>
    <p class="text-lg font-semibold">{currentPage + 1}</p>
    <button class={clsx("btn p-2 text-white rounded", {
      "bg-gray-500": pageCount < 10,
      "bg-blue-500 hover:bg-blue-600": pageCount == 10
    })} on:click={() => currentPage++} disabled = {pageCount < 10}>Next</button>
  </div>
</main>

<style>
  /* CSS styles */
  .container {
    max-width: 800px;
  }
  .btn {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
</style>
