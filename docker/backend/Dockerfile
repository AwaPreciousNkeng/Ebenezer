# Build stage
FROM maven:4.0.0-rc-4-openjdk-25 as build
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM amazoncorretto:25
ARG PROFILE=dev
ARG APP_VERSION=1.0.0

# define few things
WORKDIR /app
COPY --from=build /build/target/Ebenezer-*.jar /app/

EXPOSE 8080

ENV DB_URL=jdbc:postgresql://ebenezer_postgres:5432/ebenezer
ENV JAR_VERSION=${APP_VERSION}
ENV ACTIVE_PROFILE=${PROFILE}

CMD java -jar -Dspring.profiles.active=${ACTIVE_PROFILE} -Dspring.datasource.url=${DB_URL} Ebenezer-${JAR_VERSION}.jar