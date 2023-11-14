path: {{name}}/{{{options.packagePath}}}/config/db
---
package {{options.package}}.config.db;

import java.util.Arrays;
import java.util.HashSet;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariDataSource;

import org.apache.ibatis.session.AutoMappingBehavior;
import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.mybatis.spring.boot.autoconfigure.SpringBootVFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

@Configuration
@MapperScan(basePackages = {"{{options.package}}.mapper"})
public class DBConfiguration {

	@Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource mariadbDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
 
 
    @Bean
    @Primary
    public SqlSessionFactory sqlSessionFactoryMain(@Autowired @Qualifier("mariadbDataSource") DataSource dataSource) throws Exception {
        
        org.apache.ibatis.session.Configuration configuration = this.getMybatisConfig();
 
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setVfs(SpringBootVFS.class);
        factoryBean.setConfiguration(configuration);
        
        factoryBean.setTypeAliasesPackage("com.skmove.muv.evrental.dto");
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resource = resolver.getResources("mapper/xml/*.xml");
        factoryBean.setMapperLocations(resource);
 
        return factoryBean.getObject();
    }
 
 
    
    @Bean(name = "sqlSessionMain")
    @Primary
    public SqlSession sqlSessionMain(@Autowired @Qualifier("sqlSessionFactoryMain") SqlSessionFactory factory) {
        return new SqlSessionTemplate(factory);
    }
 
    private org.apache.ibatis.session.Configuration getMybatisConfig() {
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setCacheEnabled(true);
        configuration.setLazyLoadingEnabled(false);
        configuration.setAggressiveLazyLoading(false);
        configuration.setMultipleResultSetsEnabled(true);
        configuration.setUseColumnLabel(true);
        configuration.setAutoMappingBehavior(AutoMappingBehavior.PARTIAL);
        configuration.setDefaultExecutorType(ExecutorType.SIMPLE);
        configuration.setDefaultStatementTimeout(25000);
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setJdbcTypeForNull(JdbcType.NVARCHAR);
        configuration.setLazyLoadTriggerMethods(new HashSet<>(Arrays.asList("equals", "clone", "hashCode", "toString")));
        configuration.setLogPrefix("[SQL]");
 
        return configuration;
    }

}