path: gateway/src/main/java/com/example/template
---
package com.example.template;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class ResourceServerConfiguration {

    @Bean
    SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) throws Exception {

        http
                .cors().and()
                .csrf().disable()
                .authorizeExchange()
                .pathMatchers("/products/**","/goods/**","/oauth/**","/login/**").permitAll()
                .anyExchange().authenticated()
                .and()
                .oauth2ResourceServer()
                .jwt()
                ;

        return http.build();
    }

}
