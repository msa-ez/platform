package com.example.template.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import com.example.template.entity.User;
import com.example.template.repository.UserRepository;
import org.springframework.web.context.WebApplicationContext;

import javax.annotation.PostConstruct;


@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	@Autowired
	private WebApplicationContext applicationContext;
	private UserRepository repository;

	@PostConstruct
	public void completeSetup() {
		repository = applicationContext.getBean(UserRepository.class);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		User user = repository.findByUsername(username);
		
		if(ObjectUtils.isEmpty(user)) {
			throw new UsernameNotFoundException("Invalid resource owner, please check resource owner info !");
		}
		
		user.setAuthorities(AuthorityUtils.createAuthorityList(String.valueOf(user.getRole())));
		
		return user;
	}

}
