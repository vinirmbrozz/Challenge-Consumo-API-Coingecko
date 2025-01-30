version=':v1.00' # Versão Inicial

# echo "TROCAR A VERSAO DAS IMAGENS EM docker-compose.yml"
# sed -i'' -e 's/:v1.00/:v4.00/g' docker-compose.yml

echo "BUILD IMAGES ${version}"

cd challenge
echo CHALLENGE 
docker build -t desafiotruther-challenge${version} .
cd ..