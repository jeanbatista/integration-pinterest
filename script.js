// Código de autorização.
let code = '';
// Identificador do projeto criado no Pinterest.
const CLIENT_ID = '1234';
// Código secreto do projeto criado no Pinterest
const CLIENT_SECRET = '12345';
// URI de redicionamento de página depois.
const URI = 'https://localhost:443/oauth-pinterest/';
// URL base dos recursos da API do Pinterest.
const BASE_API = `https://api.pinterest.com`;

/**
 * Remove imagem.
 */
function removePin(pin, board) {
    let token = sessionStorage.getItem("token");
    $.ajax({
        method: "DELETE",
        url: `${BASE_API}/v1/pins/${pin}/?access_token=${token}`,
        success: function (data) {
            alert("Imagem excluída com sucesso.");
            getPinsByBoard(board);
        },
        error: function (error) {
           alert(`Erro: ${error.responseText}`);
        }
    });   
}

/**
 * Remove álbum.
 * @param {*} board - identificador do álbum.
 */
function removeBoard(board) {
    let token = sessionStorage.getItem("token");
    $.ajax({
        method: "DELETE",
        url: `${BASE_API}/v1/boards/${board}/?access_token=${token}`,
        success: function (data) {
            alert("Álbum excluído com sucesso.");
            getAllBoard();
        },
        error: function (error) {
           alert(`Erro: ${error.responseText}`);
        }
    });   
}

/**
 * Criar imagem.
 */
function cratePin() {
    let token = sessionStorage.getItem("token");
    let board = sessionStorage.getItem("algumSelected");
    $.ajax({
        method: "POST",
        url: `${BASE_API}/v1/pins/?access_token=${token}`,
        data: {
            board: board,
            note: $("#notaFoto").val(),
            link: $("#image").val(),
            image_url: $("#image").val()
        },
        success: function (data) {
            alert("Imagem inserida com sucesso.");
            sessionStorage.removeItem("algumSelected");
            $('#txtAlbumSelected').html("");
            $("#notaFoto").val("");
            $("#image").val("");
            getPinsByBoard(board);
        },
        error: function (error) {
           alert(`Erro: ${error.responseText}`);
        }
    });    
}

/**
 * Controle do combobox do modal de criar imagem.
 * @param {*} album - identificador do álbum.
 * @param {*} name - nome do álbum.
 */
function controlAlgumSelected(album, name) {
   $('#txtAlbumSelected').html(name);
   sessionStorage.setItem("algumSelected", album);
}

/**
 * Recupera todos as imagens de um álbum.
 * @param {*} board - identificador do álbum.
 */
function getPinsByBoard(board) {
    let token = sessionStorage.getItem("token");
    $.ajax({
        method: "GET",
        url: `${BASE_API}/v1/boards/${board}/pins/?access_token=${token}`,
        success: function (data) {
            const result = data;
            let strExit = '';
            for (i=0; i<result.data.length; i++) {
                strExit += `
                    <div class="col-sm-3 fotos">
                        <img src="${result.data[i].link}" alt="album">
                        <div>
                            <button type="button" class="btn btn-default btn-sm" onclick="removePin('${result.data[i].id}', '${board}')">
                                <span class="glyphicon glyphicon-remove"></span> Remover 
                            </button>                          
                        </div>                           
                    </div>                                    
                `;
            }
            if (strExit == '')
                $('#fotos').html("<p>Esse álbum não possui nenhuma foto.</p>");
            else
                $('#fotos').html(strExit);
        }   
    });
}

/**
 * Recupera todos os álbuns.
 */
function getAllBoard() {
    let token = sessionStorage.getItem("token");
    $.ajax({
        method: "GET",
        url: `${BASE_API}/v1/me/boards/?access_token=${token}`,
        success: function (data) {
            const result = data;
            let strExit = '';
            let strModalAlbuns = '';
            for (i=0; i<result.data.length; i++) {
                strExit += `
                    <div class="col-sm-3 album">
                        <a href="#" onclick="javascript:getPinsByBoard('${result.data[i].id}')">
                            <div class="img-thumbnail album-content">
                                <img src="./icons/ic_collections.png" alt="album">
                                <p>${result.data[i].name}</p>
                            </div>
                        </a>
                        <div>
                            <button type="button" class="btn btn-default btn-sm" onclick="removeBoard('${result.data[i].id}')">
                                <span class="glyphicon glyphicon-remove"></span> Remover 
                            </button>                          
                        </div>                      
                    </div> 
                `;

                strModalAlbuns += `
                    <li><a href="#" onclick="javascript:controlAlgumSelected('${result.data[i].id}', '${result.data[i].name}')">${result.data[i].name}</a></li> 
                `;
            }
            if (strExit == "")
                $('#album').html("<p>Nenhum álbum foi encontrado.</p>");
            else
                $('#album').html(strExit);
                
            $('#dropAlbuns').html(strModalAlbuns);
        }   
    });
}

/**
 * Cria álbum.
 */
function createBoard() {
    let token = sessionStorage.getItem("token");

    $.ajax({
        method: "POST",
        url: `${BASE_API}/v1/boards/?access_token=${token}`,
        data: {
            name: $("#nomeAlbum").val(),
            description: $("#descAlbum").val()
        },
        success: function (data) {
           getAllBoard();
            $("#nomeAlbum").val("");
            $("#descAlbum").val("");
        },
        error: function (error) {
            alert("Ocorreu erro ao criar álbum");
        }
    });
}

/**
 * Recupera código de autorização.
 */
function getCod() {
    let u = new URL(window.location);
    return u.searchParams.get("code");
}

/**
 * Recupera token para acesso aos recursos da API.
 */
function getToken() {
    code = getCod();
    if (code) {
        if (sessionStorage.getItem('token') == undefined) {
            let url = `${BASE_API}/v1/oauth/token?grant_type=authorization_code&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;
            $.post( url, function( data ) {
                sessionStorage.setItem("token", data.access_token);
                getAllBoard();
            });  
        } else {
            getAllBoard();
        }
    }  
}

/**
 * chamada do método de recuperar token.
 */
getToken();

/**
 */
if (!code)
    window.location = `${BASE_API}/oauth/?response_type=code&redirect_uri=${URI}&client_id=${CLIENT_ID}&scope=read_public,write_public&0e6f65cbd5aec8ab`;