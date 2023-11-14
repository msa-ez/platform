package com.example.template;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.template.entity.User;
import com.example.template.repository.UserRepository;


@SpringBootApplication
public class AuthorizationServerApplication implements CommandLineRunner {

	public static void main( String[] args )
	{
		SpringApplication.run(AuthorizationServerApplication.class, args);
	}

	// TODO 삭제 - 테스트로 유저를 넣어서 확인하는 코드입니다.
	// sever.jsk 생성 README.md 확인 후 src/main/resources 폴더에 넣으세요.
	@Autowired
	private UserRepository repository;
	@Autowired private PasswordEncoder passwordEncoder;

	@Override
	public void run(String... args) throws Exception {

		User user = new User();
		user.setUsername("1@uengine.org");
		user.setPassword(passwordEncoder.encode("1"));
		user.setNickName("유엔진");
		user.setAddress("서울시");
		user.setRole("USER_ADMIN");
		repository.save(user);

	}


	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
