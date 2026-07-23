# Etapa 1: Compilación del JAR con Maven y Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos archivos de dependencias y código fuente
COPY pom.xml .
COPY src ./src

# Compilamos omitiendo los tests para mayor rapidez
RUN mvn clean package -DskipTests

# Etapa 2: Imagen ligera solo para ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el ejecutable .jar generado
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]