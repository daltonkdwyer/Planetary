animal_dict = {}
room_dict = {}

animal_dict["Animal"] = {"Elephant": {"Name": "Ralph", "Age":"17", "Color":"Grey"}}

room_dict["rc_car1"] = {"Participants":["Bob", "Jerry"]}

room_dict["rc_car1"]["Offer"] = "123" 

print(room_dict)
print(room_dict["rc_car1"]["Participants"][1])


my_num = "Bannana"

if my_num == "Bannana":
    print("It does equal 5")

else:
    print("Else")