package vn.cas.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import vn.cas.common.security.ApiAccessDeniedHandler;
import vn.cas.common.security.ApiAuthenticationEntryPoint;
import vn.cas.common.security.FirebaseAuthenticationFilter;
import vn.cas.common.constants.ApiPaths;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            FirebaseAuthenticationFilter firebaseAuthenticationFilter,
            ApiAuthenticationEntryPoint authenticationEntryPoint,
            ApiAccessDeniedHandler accessDeniedHandler) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(ApiPaths.STATUS, ApiPaths.ACTUATOR_HEALTH, ApiPaths.ACTUATOR_INFO).permitAll()
                        .requestMatchers(ApiPaths.AUTH_PATTERN).hasAnyRole("ADMIN", "SUPER_ADMIN", "OPERATOR")
                        .requestMatchers(ApiPaths.ADMIN_PATTERN).hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(ApiPaths.OPERATOR_PATTERN).hasAnyRole("ADMIN", "SUPER_ADMIN", "OPERATOR")
                        .anyRequest().permitAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
