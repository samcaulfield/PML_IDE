# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class KeywordCompletion(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_keyword_completion(self):
        driver = self.driver
        f = open('property')
	project_name = f.read()
	f.close()
	driver.get(self.base_url + "/" + project_name + "/")
        driver.find_element_by_css_selector("div.ace_content").click()
	print "Testing for keyword completion"	
	dic = {"proc" : "process", "it" : "iteration", "ac":"action",
		"br":"branch", "re":"requires","prov":"provides",
		"sel":"selection","sc":"script","ag":"agent",
		"seq":"sequence"}
	for key in dic.keys():
		driver.find_element_by_class_name("ace_text-input").clear()
		driver.find_element_by_class_name("ace_text-input").send_keys(key,Keys.RETURN)
		driver.find_element_by_link_text("File").click()
		driver.find_element_by_link_text("File").click()
		text = driver.find_element_by_id("textEditor").text
		#ab = re.compile(".*process")
		if text != "1\n%s" % dic[key]:
			raise Exception ("Keyword test for %s failed!!!!!" % dic[key])
		else:
			print "The test has passed for %s keyword" %dic[key]	
	
	driver.find_element_by_class_name("ace_text-input").clear()
	driver.find_element_by_class_name("ace_text-input").send_keys("""process whatever{action what""",Keys.RETURN)
	driver.find_element_by_link_text("File").click()
	driver.find_element_by_link_text("File").click()
	text = driver.find_element_by_id("textEditor").text	
	if text != "1\nprocess whatever{action whatever":
		raise Exception ("Resourse completion not passed!")
	else:
		print "Resource completion test passed"
    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
