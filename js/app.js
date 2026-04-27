import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* TROCA DE TELA */
function mostrar(id){
    ["login","dashboard","cadastro","sorteio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* LOGIN CORRETO (SEM CRIAR USUÁRIO) */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth, email.value, senha.value);
    }catch(err){
        console.log(err);

        if(err.code === "auth/invalid-credential"){
            alert("Email ou senha incorretos");
        } else if(err.code === "auth/user-not-found"){
            alert("Usuário não existe");
        } else {
            alert("Erro: " + err.code);
        }
    }
};

window.logout = ()=> signOut(auth);

/* AUTO LOGIN */
onAuthStateChanged(auth,(u)=>{
    if(u){
        mostrar("dashboard");
    } else {
        mostrar("login");
    }
});
