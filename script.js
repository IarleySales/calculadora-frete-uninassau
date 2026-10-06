const cepInput = document.getElementById("cep");
const botao = document.getElementById("calcular");

const endereco = document.getElementById("endereco");
const cidade = document.getElementById("cidade");
const distancia = document.getElementById("distancia");
const uber = document.getElementById("uber");
const frete = document.getElementById("frete");

const uninassau = {
    latitude: -3.7786,
    longitude: -38.5658
};

botao.addEventListener("click", async function() {

    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("Digite um CEP válido.");
        return;
    }

    botao.textContent = "Calculando...";
    botao.disabled = true;

    try {

        const respostaCep = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        const dadosCep = await respostaCep.json();

        if (dadosCep.erro) {
            alert("CEP não encontrado.");
            return;
        }

        endereco.textContent =
            `${dadosCep.logradouro}, ${dadosCep.bairro}`;

        cidade.textContent =
            `${dadosCep.localidade} - ${dadosCep.uf}`;

        const enderecoCompleto = `
            ${dadosCep.logradouro},
            ${dadosCep.numero || ""},
            ${dadosCep.bairro},
            ${dadosCep.localidade},
            ${dadosCep.uf},
            Brasil
        `;

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(enderecoCompleto)}`;

        const respostaMapa = await fetch(url);

        const dadosMapa = await respostaMapa.json();

        if (dadosMapa.length === 0) {
            alert("Não foi possível localizar esse endereço.");
            return;
        }

        const latitudeDestino = parseFloat(dadosMapa[0].lat);
        const longitudeDestino = parseFloat(dadosMapa[0].lon);

        const distanciaCalculada = calcularDistancia(
            uninassau.latitude,
            uninassau.longitude,
            latitudeDestino,
            longitudeDestino
        );

        const valorUber = 5 + (distanciaCalculada * 1.80);

        const valorFrete = valorUber + 4;

        distancia.textContent =
            `${distanciaCalculada.toFixed(1)} km`;

        uber.textContent =
            `R$ ${valorUber.toFixed(2).replace(".", ",")}`;

        frete.textContent =
            `R$ ${valorFrete.toFixed(2).replace(".", ",")}`;

    } catch (erro) {

        alert("Não foi possível calcular a distância.");

        console.error(erro);

    } finally {

        botao.textContent = "Calcular frete";
        botao.disabled = false;

    }

});


function calcularDistancia(lat1, lon1, lat2, lon2) {

    const raioTerra = 6371;

    const diferencaLatitude =
        (lat2 - lat1) * Math.PI / 180;

    const diferencaLongitude =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(diferencaLatitude / 2) *
        Math.sin(diferencaLatitude / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(diferencaLongitude / 2) *
        Math.sin(diferencaLongitude / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return raioTerra * c;
}