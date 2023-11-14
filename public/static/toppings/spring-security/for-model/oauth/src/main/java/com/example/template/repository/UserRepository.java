package com.example.template.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.example.template.entity.User;

@Repository
public interface UserRepository extends CrudRepository<User, String> {
	User findByUsername(String username);
}
