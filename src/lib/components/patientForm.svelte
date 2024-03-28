<!-- Svelte code -->
<script lang="ts">
    // Import necessary modules
    import type { Patient } from "fhir/r4";
    import { fhirAPI } from "../../../fhirAPI";
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import {fade,slide, scale} from 'svelte/transition';
    import {flip} from 'svelte/animate';


    // Declare variables
    export let id: string = ''
    let dateToday = new Date().toISOString().split('T')[0]
    let message : any | undefined = undefined
    let patientResource : Patient
    let formLoading = false

    // Function to handle form submission
    const  handleSubmit = async (e:SubmitEvent) =>{
        e.preventDefault();

        // Create FHIR resource object
        let fhirResource: Patient = {
            resourceType: "Patient"
        }
        fhirResource.name =[{
            "given": [firstName],
            "family": lastName
        }]
        fhirResource.birthDate = dob
        fhirResource.telecom = [{
            system: "phone",
            value: phoneNumber
        }]
        fhirResource.gender = gender

        try {
            // Call API to create or update patient
            if (id) {
                message = await updatePatient(id,fhirResource, patientResource)
            } else{
                message = createPatient(fhirResource)
            }
            navigate("/")
        }
        catch (e: any) {
            message = e?.response?.data
        }
    }

    // Function to load patient data
    const loadPatient = async (id:string) => {
        const response = await fhirAPI.get<Patient>(`Patient/${id}`)
        const patientResource = response.data
        const name = patientResource.name?.[0]
        firstName = name?.given?.join(' ') // account for patiens with >1 given
        lastName = name?.family

        if (patientResource.gender){
            gender = patientResource?.gender
        }
        
        if (patientResource.birthDate) {
            dob = patientResource?.birthDate
        }
        
        const phoneContactPoint = patientResource.telecom?.find(f => f.system == 'phone')
        if (phoneContactPoint){
            phoneNumber = phoneContactPoint.value
        }

        return patientResource
    }

    // Function to create new patient
    const createPatient = async  (resource: Patient): Promise<any> => {
        const response = await fhirAPI.post("/Patient",resource)
        return response.data
    }

    // Function to update existing patient
    const updatePatient = async (id:string, resource: Patient , oldResource: Patient): Promise<any>  => {
        const response = await fhirAPI.put(`/Patient/${id}`,{...oldResource, ...resource})
        return response.data
    }

    // Initialize variables and load patient data on component mount
    let firstName: any | undefined
    let lastName: string | undefined
    let gender: "other" | "male" | "female" | "unknown" | undefined = undefined
    let dob: string | undefined
    let phoneNumber :string | undefined
    onMount(async () => {
        formLoading = true
        patientResource = await loadPatient(id)
        formLoading = false
    })
</script>

<main class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4">
        {#if id}
            Editing Patient {id}
        {:else}
            Create New Patient 
        {/if}
    </h1>

    {#if formLoading}
        <p class="text-gray-600">Loading...</p>
    {:else}
        <form on:submit={e => handleSubmit(e)} class="space-y-4" in:slide out:scale|local>
            <div>
                <label for="first_name" class="font-semibold block">First Name</label>
                <input bind:value={firstName} id="first_name" type="text" class="border rounded p-2 w-full" required>
            </div> 
            <div>
                <label for="last_name" class="font-semibold block">Last Name</label>
                <input bind:value={lastName} id="last_name" type="text" class="border rounded p-2 w-full" required>
            </div>  
            <div>
                <label for="gender" class="font-semibold block">Gender</label>
                <select bind:value={gender} id="gender" class="border rounded p-2 w-full">
                    <option value={undefined} disabled>Please select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>  
            <div>
                <label for="dob" class="font-semibold block">Birthdate</label>
                <input bind:value={dob} id="dob" type="date" max={dateToday} class="border rounded p-2 w-full">
            </div>  
            <div>
                <label for="phoneNumber" class="font-semibold block">Phone Number</label>
                <input bind:value={phoneNumber} id="phoneNumber" class="border rounded p-2 w-full">
            </div>   
            <button type="submit" class="btn p-2 text-white bg-blue-500 hover:bg-blue-600 w-full rounded">
                {#if id}
                    Update
                {:else}
                    Create
                {/if}
            </button>
        </form>
    {/if}

    {#if message}
        <pre class="text-gray-600 mt-4">
            Status: {JSON.stringify(message)}
        </pre>
    {/if}
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
