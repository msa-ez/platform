package com.example.template.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityWebFilterChain SecurityWebFilterChain(ServerHttpSecurity http) {

        http
                .authorizeExchange()
                //.pathMatchers("/serviece/**").permitAll()  // 인증없이 접속 가능한 경로 추가
                .anyExchange()
                .authenticated()
                .and()
                .oauth2Login()
                .and()
                .csrf()
                .disable()
                .oauth2ResourceServer()
                .jwt();
                 // to redirect to oauth2 login page.

        return http.build();
    }

}