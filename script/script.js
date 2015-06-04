$.ajax({
    url: 'http://disfuncionarios.org:3000/api/zone',
    dataType: 'json',
    type: 'get',
    cache: false,
    //Monterrey, San Nicolás, San Pedro y Nuevo León
    success: function(data){
        $("#municipios").append('<option value="" selected>Municipio</option>')
        $(data.muncipios).each(function(index, value){
            if(this.id == "0" ||this.id == "3"||this.id == "8"||this.id == "12"){
              $("#municipios").append('<option value="'+ this.id +'">'+ this.name +'</option>')  
            }
            

            //console.log(value.name);
        });
    }
});

//http://disfuncionarios.org:3000/api/all_candidates

$.ajax({
    url: 'http://disfuncionarios.org:3000/api/all_candidates',
    dataType: 'json',
    type: 'get',
    cache: false,
    success: function(data){
        console.log("es success");
         $("#candidatos").append('<option value="" selected>Candidat@</option>');
        $(data).each(function(index, value){
            var name = JSON.parse(value).name;
            var id = JSON.parse(value).id;
            var zone = JSON.parse(value).zone;
            var is_candidate = JSON.parse(value).is_candidate != "2";
            if(zone == "0" ||zone == "3"||zone == "8"||zone == "12"){
                if(is_candidate){
                    $("#candidatos").append('<option value="'+ id +'">'+ name +'</option>');
                }  
            }
            console.log(name);
        });
    }
});

