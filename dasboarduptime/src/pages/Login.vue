<template>

    <div id="logform">

      <div class="container h-100">
        <div class="row h-100 justify-content-center align-items-center-start">
          <form>
            <div class="form-group">
              <label for="userName">Nom d'utilisateur</label>
              <input type="text" class="form-control" id="userName" aria-describedby="Utilisateur" placeholder="Nom d'utilisateur">
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" class="form-control" id="password" placeholder="Mot de passe">
            </div>
            <div class="col-12 text-center">
              <button type="submit" class="btn btn-primary my-2 my-sm-0">Se connecter</button>
            </div>
          </form>   
        </div>
      </div>
    </div>


</template>

<script>

export default {
  data(){
    return{

    }
  },
  name: 'Login',

}
</script>
