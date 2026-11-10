FROM eclipse-temurin:21-jdk AS build

WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app
RUN groupadd --system cas && useradd --system --gid cas cas
COPY --from=build /app/target/*.jar app.jar
USER cas:1000
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=50.0", "-jar", "app.jar"]
