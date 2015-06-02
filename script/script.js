$.ajax({
    url: 'script/lista.json',
    dataType: 'json',
    type: 'get',
    cache: false,
    success: function(data){

        $(data.muncipios).each(function(index, value){
            $("#municipios").append('<option value="http://disfuncionarios.org/api'+ this.name +'">'+ this.name +'</option>');

            console.log(value.name);
        });

        $(data.candidatos).each(function(index, value){
            $("#candidatos").append('<option value="http://disfuncionarios.org/api'+ this.name +'">'+ this.name +'</option>');

            console.log(value.name);
        });


    }
});
