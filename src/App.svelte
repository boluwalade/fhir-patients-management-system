<script lang="ts">
    import PatientForm from "./lib/components/patientForm.svelte";
    import PatientList from "./lib/components/patientList.svelte";
    import { Router, Link, Route } from "svelte-routing";

</script>

<main>
    <Router >  
        <div>     
          <Route path = "/">
            <PatientList></PatientList>
          </Route>
          <Route path = "/Patient">
            <PatientForm></PatientForm>
        </Route>
          <Route path = "/Patient/:id" component = {PatientForm}>
          </Route>
        </div>
      </Router>

</main>

<style>

</style>