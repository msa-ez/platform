FROM jboss/keycloak
COPY /standalone/configuration/standalone.xml /opt/jboss/keycloak/standalone/configuration/
EXPOSE 8080
ENV KEYCLOAK_VERSION=15.0.2
ENV JBOSS_HOME=/opt/jboss/keycloak
ENTRYPOINT ["/opt/jboss/tools/docker-entrypoint.sh"]

#FROM jboss/keycloak
#COPY /standalone/configuration/standalone.xml /opt/jboss/keycloak/standalone/configuration/

