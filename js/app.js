import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* TROCA DE TELA */
function mostrar(id){
    ["login","dashboard"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* LOGIN (SÓ LOGIN AGORA) */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth, email.value, senha.value);
    }catch(err){

        if(err.code === "auth/invalid-credential"){
            alert("Email ou senha incorretos");
        }else if(err.code === "auth/user-not-found"){
            alert("Usuário não existe");
        }else{
            alert(err.message);
        }

    }
};

/* CADASTRAR USUÁRIO (BOTÃO SEPARADO) */
window.registrar = async ()=>{
    try{
        await createUserWithEmailAndPassword(auth, email.value, senha.value);
        alert("Conta criada!");
    }catch(err){
        alert(err.message);
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
