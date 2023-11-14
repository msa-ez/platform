package com.example.template.config;

import com.example.template.entity.User;
import com.example.template.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.TokenEnhancer;
import org.springframework.security.oauth2.provider.token.TokenEnhancerChain;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.security.oauth2.provider.token.store.KeyStoreKeyFactory;

import java.io.PrintWriter;
import java.security.KeyPair;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;


@Configuration
@EnableAuthorizationServer
public class OAuth2AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

	public static final String CLIENT_ID = "uengine-client";
	public static final String CLIENT_SECRET = "uengine-secret";
	static final String GRANT_TYPE_PASSWORD = "password";
	static final String AUTHORIZATION_CODE = "authorization_code";
	static final String CLIENT_CREDENTIALS = "client_credentials";
	static final String REFRESH_TOKEN = "refresh_token";
	static final String IMPLICIT = "implicit";
	static final String SCOPE_READ = "read";
	static final String SCOPE_WRITE = "write";
	static final String TRUST = "trust";
	static final int ACCESS_TOKEN_VALIDITY_SECONDS = 24*60*60; 	// 24시간
	static final int FREFRESH_TOKEN_VALIDITY_SECONDS = 6*60*60;

	@Autowired
	@Qualifier("authenticationManagerBean")
	private AuthenticationManager authenticationManager;

	@Autowired
	PasswordEncoder passwordEncoder;
	@Autowired
	UserRepository userRepository;

	@Autowired
	private Environment env;

	@Override
	public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
		security.accessDeniedHandler((request, response, exception)->{
										response.setContentType("application/json;charset=UTF-8");
							            response.setHeader("Cache-Control", "no-cache");
							            PrintWriter writer = response.getWriter();
							            writer.println(new AccessDeniedException("access denied !"));
									})
		.authenticationEntryPoint((request, response, exception)->{
									response.setContentType("application/json;charset=UTF-8");
						            response.setHeader("Cache-Control", "no-cache");
						            PrintWriter writer = response.getWriter();
						            writer.println(new AccessDeniedException("access denied !"));
								})
		.checkTokenAccess("permitAll()");
		;
	}

	/**
	 * 클라이언트 인증을 인메모리로 하였지만 클라이언트를 등록 및 별도로 관리하려면
	 * clientDetailsService 를 만든 후에
	 * clients.withClientDetails(clientDetailsService);
	 * 을 사용하면 된다.
	 * @param clients
	 * @throws Exception
	 */
	@Override
	public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
//		clients.withClientDetails(clientDetailsService);

		clients
				.inMemory()
				.withClient(CLIENT_ID)
				.secret(passwordEncoder.encode(CLIENT_SECRET))
				.authorizedGrantTypes(GRANT_TYPE_PASSWORD, CLIENT_CREDENTIALS, REFRESH_TOKEN, IMPLICIT )
				.scopes(SCOPE_READ, SCOPE_WRITE, TRUST)
				.authorities("ROLE_CLIENT","ROLE_TRUSTED_CLIENT")
				.accessTokenValiditySeconds(ACCESS_TOKEN_VALIDITY_SECONDS).
				refreshTokenValiditySeconds(FREFRESH_TOKEN_VALIDITY_SECONDS);
	}

	@Override
	public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {

		TokenEnhancerChain tokenEnhancerChain = new TokenEnhancerChain();
        tokenEnhancerChain.setTokenEnhancers(
                Arrays.asList(tokenEnhancer(), accessTokenConverter()));

		endpoints
			.authenticationManager(authenticationManager)
			.tokenStore(tokenStore()) //토큰과 관련된 인증 데이터를 저장, 검색, 제거, 읽기를 정의
			.tokenEnhancer(tokenEnhancerChain)
			;
	}

	@Bean
	public JwtTokenStore tokenStore() {
		return new JwtTokenStore(accessTokenConverter());
	}

	@Bean
	public KeyPair makeKeyPair(){
		KeyPair keyPair = new KeyStoreKeyFactory(
				new ClassPathResource("server.jks"), "qweqwe".toCharArray())
				.getKeyPair("uengine", "qweqwe".toCharArray());
		return keyPair;
	}

	/**
	 * JWT 토큰을 sign 하는 방법중 간단하게 쓰려면 Key 값을 쓰면되고,
	 * jks(java key store) 파일로 쓰려면 keypair 방식을 사용하면 됨
	 */
	@Bean
	public JwtAccessTokenConverter accessTokenConverter() {
		JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
		converter.setKeyPair(this.makeKeyPair());	// use Spring cloud gateway
//		converter.setSigningKey("non-prod-signature");// use zuul 1
		return converter;
	}


	/**
	 * JWT 토큰을 생성할때 추가적인 정보를 넣어주는 부분이다.
	 * 유저의 상세 정보를 추가하고 싶을때는 userService or userRepository 를 Autowired 하여 조회하여 데이터를 추가할수있다.
	 * @return
	 */
	@Bean
    public TokenEnhancer tokenEnhancer(){
        return (accessToken, authentication) -> {

            if(authentication.isAuthenticated()) {
                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("company", "Uengine");
				if( !CLIENT_CREDENTIALS.equals(authentication.getOAuth2Request().getGrantType()) ){
					User user = (User)authentication.getPrincipal();
					additionalInfo.put("nickname", user.getNickName());
					additionalInfo.put("address", user.getAddress());
				}

//                String clientId = authentication.getOAuth2Request().getClientId();
//                logger.debug("client ID : " + clientId);

//                ClientDetails client = clientService.loadClientByClientId(clientId);
//                Map<String, Object> addInfo = client.getAdditionalInformation();
////                logger.debug("client : " + client.toString());
//
//                if(addInfo!=null){
//                    for(String key:addInfo.keySet()){
//                        additionalInfo.put(key, addInfo.get(key));
//                    }
//                }

                ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(additionalInfo);
            }
            return accessToken;
        };

    }
}
