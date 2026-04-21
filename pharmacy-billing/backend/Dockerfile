FROM eclipse-temurin:20-jre-alpine
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests
EXPOSE $PORT
ENTRYPOINT ["java", "-jar", "target/pharmacy-billing-0.0.1-SNAPSHOT.jar"]
